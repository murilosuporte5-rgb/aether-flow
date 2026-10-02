alter table public.opportunities add column if not exists tags text[] not null default '{}';
alter table public.opportunities add column if not exists proposal_url text;
alter table public.opportunities add column if not exists contract_url text;
alter table public.opportunities add column if not exists drive_url text;
alter table public.opportunities add column if not exists win_reason text;
alter table public.opportunities drop constraint if exists opportunities_metadata_url_check;
alter table public.opportunities add constraint opportunities_metadata_url_check check ((proposal_url is null or proposal_url ~* '^https?://') and (contract_url is null or contract_url ~* '^https?://') and (drive_url is null or drive_url ~* '^https?://'));
alter table public.opportunities drop constraint if exists opportunities_win_reason_check;
alter table public.opportunities add constraint opportunities_win_reason_check check (win_reason is null or win_reason in ('Preço e condição','Urgência do cliente','Indicação','Relacionamento','Necessidade clara','Outro'));

create or replace function public.apply_workspace_command(p_company_id uuid,p_request_id uuid,p_command jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid()); k text := p_command->>'kind';
  oid uuid; cid uuid; aid uuid; owner_id uuid; new_owner_id uuid; normalized text; tag_list text[]; proposal_url text; contract_url text; drive_url text; win_reason text; contact_name text;
  o public.opportunities%rowtype; st public.pipeline_stages%rowtype; ct public.contacts%rowtype;
  receipt public.workspace_commands%rowtype; reply jsonb; next_step jsonb;
  due timestamptz; action_type text; action_note text; reason text; note text;
  old_stage_name text; terminal text; value_amount numeric; is_demo boolean;
begin
  if actor is null or not private.is_company_member(p_company_id) then raise exception using errcode='42501',message='Empresa não autorizada.'; end if;
  if p_request_id is null or jsonb_typeof(p_command) <> 'object' then raise exception 'Comando inválido.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_company_id::text||actor::text||p_request_id::text,0));
  select * into receipt from public.workspace_commands where company_id=p_company_id and actor_id=actor and request_id=p_request_id;
  if found then
    if receipt.command <> p_command then raise exception 'Identificador de requisição já utilizado.'; end if;
    return receipt.result;
  end if;
  if length(p_command::text)>12000 or length(coalesce(p_command->>'result',''))>500 or length(coalesce(p_command->>'details',''))>500 or length(coalesce(p_command->>'source',''))>80 or length(coalesce(p_command->>'organization',''))>100 then raise exception 'Os dados excedem o tamanho permitido.'; end if;
  if k='create' then
    contact_name := btrim(p_command->>'contactName');
    if coalesce(contact_name,'')='' or coalesce(btrim(p_command->>'title'),'')='' then raise exception 'Informe cliente e oportunidade.'; end if;
    normalized := public.normalize_contact_phone(p_command->>'phone');
    if normalized is null then raise exception 'Informe um telefone válido com DDD.'; end if;
    select * into st from public.pipeline_stages where company_id=p_company_id and id=(p_command->>'stageId')::uuid;
    if not found or st.kind <> 'open' then raise exception 'Selecione um estágio aberto.'; end if;
    owner_id := coalesce(nullif(p_command->>'ownerId','')::uuid,actor);
    if not exists(select 1 from public.memberships m where m.company_id=p_company_id and m.user_id=owner_id) then raise exception 'Responsável não pertence à empresa.'; end if;
    value_amount := nullif(p_command->>'value','')::numeric;
    if value_amount < 0 or value_amount::text in ('NaN','Infinity','-Infinity') then raise exception 'Valor inválido.'; end if;
    if nullif(p_command->>'reuseContactId','') is not null then
      select * into ct from public.contacts where company_id=p_company_id and id=(p_command->>'reuseContactId')::uuid and phone_normalized=normalized for update;
      if not found then raise exception 'Cliente existente não encontrado nesta empresa.'; end if;
      cid := ct.id;
    else
      insert into public.contacts(company_id,name,phone,organization)
      values(p_company_id,contact_name,'+'||normalized,nullif(btrim(p_command->>'organization'),''))
      on conflict (company_id,phone_normalized) where phone_normalized is not null do nothing returning id into cid;
      if cid is null then
        select * into ct from public.contacts where company_id=p_company_id and phone_normalized=normalized;
        return jsonb_build_object('ok',false,'code','DUPLICATE_CONTACT','contact',jsonb_build_object('id',ct.id,'name',ct.name));
      end if;
    end if;
    tag_list := array( select btrim(x) from unnest(string_to_array(coalesce(p_command->>'tags',''),',')) x where btrim(x) <> '' );
    if cardinality(tag_list) > 8 or exists(select 1 from unnest(tag_list) x where length(x) > 32) then raise exception 'Use até oito tags com no máximo 32 caracteres.'; end if;
    proposal_url := nullif(btrim(p_command->>'proposalUrl'),''); contract_url := nullif(btrim(p_command->>'contractUrl'),''); drive_url := nullif(btrim(p_command->>'driveUrl'),'');
    if proposal_url is not null and proposal_url !~* '^https?://' or contract_url is not null and contract_url !~* '^https?://' or drive_url is not null and drive_url !~* '^https?://' then raise exception 'Os links devem começar com http:// ou https://.'; end if;
    insert into public.opportunities(company_id,contact_id,title,stage_id,owner_id,estimated_value,status,source,details,commercial_availability,tags,proposal_url,contract_url,drive_url)
    values(p_company_id,cid,btrim(p_command->>'title'),st.id,owner_id,value_amount,'open',nullif(btrim(p_command->>'source'),''),nullif(btrim(p_command->>'details'),''),nullif(p_command->>'commercialAvailability',''),tag_list,proposal_url,contract_url,drive_url) returning * into o;
    oid := o.id;
    perform private.append_opportunity_event(p_company_id,oid,'created','Oportunidade criada',jsonb_build_object('contact_id',cid,'stage_id',st.id));
    if coalesce(p_command->>'actionType','')<>'' then
      next_step := jsonb_build_object('type',p_command->>'actionType','dueAt',p_command->>'dueAt','note',p_command->>'note');
    end if;
  else
    oid := nullif(p_command->>'id','')::uuid;
    select * into o from public.opportunities where company_id=p_company_id and id=oid for update;
    if not found then raise exception using errcode='42501',message='Oportunidade não encontrada nesta empresa.'; end if;
    if k='edit' then
      if coalesce(btrim(p_command->>'contactName'),'')='' or coalesce(btrim(p_command->>'title'),'')='' then raise exception 'Informe cliente e oportunidade.'; end if;
      normalized := public.normalize_contact_phone(p_command->>'phone');
      if normalized is null then raise exception 'Informe um telefone válido com DDD.'; end if;
      value_amount := nullif(p_command->>'value','')::numeric;
      if value_amount < 0 or value_amount::text in ('NaN','Infinity','-Infinity') then raise exception 'Valor inválido.'; end if;
      update public.contacts set name=btrim(p_command->>'contactName'),phone='+'||normalized,organization=nullif(btrim(p_command->>'organization'),'') where company_id=p_company_id and id=o.contact_id;
      if nullif(p_command->>'ownerId','') is not null then new_owner_id := (p_command->>'ownerId')::uuid; if not exists(select 1 from public.memberships m where m.company_id=p_company_id and m.user_id=new_owner_id) then raise exception 'Responsável não pertence à empresa.'; end if; else new_owner_id := o.owner_id; end if;
      tag_list := array( select btrim(x) from unnest(string_to_array(coalesce(p_command->>'tags',''),',')) x where btrim(x) <> '' );
      if cardinality(tag_list) > 8 or exists(select 1 from unnest(tag_list) x where length(x) > 32) then raise exception 'Use até oito tags com no máximo 32 caracteres.'; end if;
      proposal_url := nullif(btrim(p_command->>'proposalUrl'),''); contract_url := nullif(btrim(p_command->>'contractUrl'),''); drive_url := nullif(btrim(p_command->>'driveUrl'),'');
      if proposal_url is not null and proposal_url !~* '^https?://' or contract_url is not null and contract_url !~* '^https?://' or drive_url is not null and drive_url !~* '^https?://' then raise exception 'Os links devem começar com http:// ou https://.'; end if;
      update public.opportunities set title=btrim(p_command->>'title'),estimated_value=value_amount,source=nullif(btrim(p_command->>'source'),''),details=nullif(btrim(p_command->>'details'),''),commercial_availability=nullif(p_command->>'commercialAvailability',''),owner_id=new_owner_id,tags=tag_list,proposal_url=proposal_url,contract_url=contract_url,drive_url=drive_url,updated_at=now() where company_id=p_company_id and id=oid;
      perform private.append_opportunity_event(p_company_id,oid,'edited','Dados da oportunidade atualizados');
    elsif k in ('schedule','reschedule') then
      if o.status <> 'open' then raise exception 'Reabra a oportunidade antes de agendar.'; end if;
      next_step := jsonb_build_object('type',p_command->>'actionType','dueAt',p_command->>'dueAt','note',p_command->>'note');
    elsif k='complete' then
      if o.status <> 'open' then raise exception 'Esta oportunidade está encerrada.'; end if;
      next_step := p_command->'nextStep';
      if jsonb_typeof(next_step) is distinct from 'object' then raise exception 'Informe o próximo passo ou encerre a oportunidade.'; end if;
      aid := nullif(p_command->>'activityId','')::uuid;
      update public.activities set status='done',completed_at=now() where company_id=p_company_id and opportunity_id=oid and id=aid and status='pending';
      if not found then raise exception 'Ação pendente não encontrada. Atualize a tela.'; end if;
      note := nullif(btrim(p_command->>'result'),'');
      if coalesce((p_command->>'contactConfirmed')::boolean,false) then
        if note is null then raise exception 'Registre o resultado do contato.'; end if;
        update public.opportunities set last_interaction_at=now() where company_id=p_company_id and id=oid;
      end if;
      perform private.append_opportunity_event(p_company_id,oid,'activity_completed','Ação concluída',jsonb_build_object('activity_id',aid,'result',note,'contact_confirmed',coalesce((p_command->>'contactConfirmed')::boolean,false)));
      terminal := next_step->>'outcome';
    elsif k='stage' then
      select * into st from public.pipeline_stages where company_id=p_company_id and id=(p_command->>'stageId')::uuid;
      if not found then raise exception 'Estágio inválido.'; end if;
      terminal := nullif(st.kind,'open');
      if terminal is null then
        select name into old_stage_name from public.pipeline_stages where company_id=p_company_id and id=o.stage_id;
        update public.opportunities set stage_id=st.id,status='open',loss_reason=null,loss_note=null,updated_at=now() where company_id=p_company_id and id=oid;
        perform private.append_opportunity_event(p_company_id,oid,'stage_changed',old_stage_name||' → '||st.name,jsonb_build_object('from',o.stage_id,'to',st.id));
      end if;
    elsif k='whatsapp_opened' then
      select * into ct from public.contacts where company_id=p_company_id and id=o.contact_id;
      if public.normalize_contact_phone(ct.phone) is null then raise exception 'Este cliente não tem telefone válido.'; end if;
      perform private.append_opportunity_event(p_company_id,oid,'whatsapp_opened','WhatsApp aberto',jsonb_build_object('opportunity_id',oid,'actor_id',actor,'timestamp',now()));
    elsif k='comment' then
      note := nullif(btrim(p_command->>'comment'),'');
      if note is null or length(note)>500 then raise exception 'Escreva uma observação de até 500 caracteres.'; end if;
      perform private.append_opportunity_event(p_company_id,oid,'comment_added',note);
    else raise exception 'Ação desconhecida.';
    end if;
  end if;

  if terminal is not null then
    if terminal not in ('won','lost') then raise exception 'Selecione Ganho ou Perdido.'; end if;
    reason := coalesce(next_step->>'lossReason',p_command->>'lossReason');
    note := coalesce(next_step->>'lossNote',p_command->>'lossNote');
    if terminal='lost' and (reason is null or reason not in ('Preço','Sem resposta','Escolheu concorrente','Adiado','Sem orçamento','Não qualificado','Sem prioridade','Outro')) then raise exception 'Informe o motivo da perda.'; end if;
    win_reason := nullif(btrim(p_command->>'winReason'),''); if terminal='won' and (win_reason is null or win_reason not in ('Preço e condição','Urgência do cliente','Indicação','Relacionamento','Necessidade clara','Outro')) then raise exception 'Informe o motivo do ganho.'; end if;
    if terminal='lost' and reason='Outro' and coalesce(btrim(note),'')='' then raise exception 'Descreva o motivo da perda.'; end if;
    if length(coalesce(note,''))>500 then raise exception 'Observação deve ter até 500 caracteres.'; end if;
    if k <> 'stage' then
      select * into st from public.pipeline_stages where company_id=p_company_id and kind=terminal order by position limit 1;
      if not found then raise exception 'A empresa não possui estágio para este resultado.'; end if;
    end if;
    update public.activities set status='replaced' where company_id=p_company_id and opportunity_id=oid and status='pending';
    update public.opportunities set stage_id=st.id,status=terminal,next_action_type=null,next_action_at=null,next_action_note=null,
      loss_reason=case when terminal='lost' then reason else null end,loss_note=case when terminal='lost' then nullif(btrim(note),'') else null end,win_reason=case when terminal='won' then win_reason else null end,updated_at=now()
      where company_id=p_company_id and id=oid;
    perform private.append_opportunity_event(p_company_id,oid,'stage_changed',o.stage_id::text||' → '||st.name,jsonb_build_object('from',o.stage_id,'to',st.id));
    perform private.append_opportunity_event(p_company_id,oid,terminal,case when terminal='won' then 'Oportunidade ganha' else 'Oportunidade perdida' end);
    if terminal='lost' then perform private.append_opportunity_event(p_company_id,oid,'loss_reason',reason,jsonb_build_object('reason',reason,'note',note)); end if;
  elsif next_step is not null then
    action_type := next_step->>'type'; due := nullif(next_step->>'dueAt','')::timestamptz; action_note := nullif(btrim(next_step->>'note'),'');
    if action_type is null or action_type not in ('WhatsApp','Ligação','Reunião','Enviar proposta','Revisar proposta','Aguardar cliente','Follow-up') or due is null or due<=now() then raise exception 'Informe uma próxima ação com data e horário futuros.'; end if;
    if length(coalesce(action_note,''))>500 then raise exception 'Observação deve ter até 500 caracteres.'; end if;
    update public.activities set status='replaced' where company_id=p_company_id and opportunity_id=oid and status='pending';
    insert into public.activities(company_id,opportunity_id,owner_id,type,due_at,note,status)
    values(p_company_id,oid,o.owner_id,action_type,due,action_note,'pending') returning id into aid;
    update public.opportunities set next_action_type=action_type,next_action_at=due,next_action_note=action_note,updated_at=now() where company_id=p_company_id and id=oid;
    perform private.append_opportunity_event(p_company_id,oid,case when k='reschedule' then 'activity_rescheduled' else 'activity_created' end,action_type||' agendado',jsonb_build_object('activity_id',aid,'type',action_type,'due_at',due,'note',action_note));
  end if;
  reply := jsonb_build_object('ok',true,'id',oid);
  insert into public.workspace_commands(company_id,actor_id,request_id,command,result) values(p_company_id,actor,p_request_id,p_command,reply);
  return reply;
end $$;
