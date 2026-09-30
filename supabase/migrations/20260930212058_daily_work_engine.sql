-- Additive daily execution layer. Unknown historical stage dates remain NULL.
alter table public.opportunities add column stage_entered_at timestamptz;
alter table public.opportunities add column waiting_started_at timestamptz;
alter table public.opportunities add constraint waiting_requires_review check(next_action_type is distinct from 'Aguardar cliente' or next_action_at is not null);
alter table public.companies add column pipeline_version integer not null default 0;
with last_stage as (
 select distinct on (company_id,opportunity_id) company_id,opportunity_id,created_at,
  coalesce(payload->>'to',payload->>'stage_id') stage_id
 from public.opportunity_history where event in ('created','stage_changed')
 order by company_id,opportunity_id,created_at desc,id desc
)
update public.opportunities o set stage_entered_at=h.created_at
from last_stage h where h.company_id=o.company_id and h.opportunity_id=o.id and h.stage_id=o.stage_id::text;

create function private.stamp_stage_entry() returns trigger language plpgsql set search_path='' as $$
declare stage_kind text;
begin
 if new.next_action_type='Aguardar cliente' then
  if tg_op='INSERT' then new.waiting_started_at:=now();
  elsif old.next_action_type is distinct from 'Aguardar cliente' then new.waiting_started_at:=now();
  else new.waiting_started_at:=old.waiting_started_at; end if;
 else new.waiting_started_at:=null; end if;
 if tg_op='INSERT' or new.stage_id is distinct from old.stage_id then
  perform 1 from public.companies where id=new.company_id for share;
  select kind into stage_kind from public.pipeline_stages where company_id=new.company_id and id=new.stage_id;
  if stage_kind is distinct from new.status then raise exception 'O pipeline mudou. Atualize a tela e tente novamente.'; end if;
  new.stage_entered_at:=now();
 else new.stage_entered_at:=old.stage_entered_at; end if;
 return new;
end $$;
revoke all on function private.stamp_stage_entry() from public,anon,authenticated;
create trigger stamp_stage_entry before insert or update on public.opportunities
for each row execute function private.stamp_stage_entry();

create function private.enrich_operational_event() returns trigger language plpgsql set search_path='' as $$
declare from_name text; to_name text;
begin
 new.created_at:=clock_timestamp();
 new.payload:=new.payload||jsonb_build_object('actor_id',new.actor_id,'timestamp',new.created_at);
 if new.event='stage_changed' then
  select name into from_name from public.pipeline_stages where company_id=new.company_id and id::text=new.payload->>'from';
  select name into to_name from public.pipeline_stages where company_id=new.company_id and id::text=new.payload->>'to';
  new.payload:=new.payload||jsonb_build_object('from_name',from_name,'to_name',to_name);
  new.description:=coalesce(from_name,'Etapa anterior')||' → '||coalesce(to_name,'Nova etapa');
 end if;
 return new;
end $$;
revoke all on function private.enrich_operational_event() from public,anon,authenticated;
create trigger enrich_operational_event before insert on public.opportunity_history
for each row execute function private.enrich_operational_event();

-- Deferral permits positive position swaps without violating position>=0.
alter table public.pipeline_stages drop constraint pipeline_stages_company_id_position_key;
alter table public.pipeline_stages add constraint pipeline_stages_company_id_position_key
 unique(company_id,position) deferrable initially immediate;
-- Final pipeline write ACL activates separately after the new onboarding runtime.

create function public.configure_pipeline(p_company_id uuid,p_request_id uuid,p_command jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); v integer; item jsonb; sid uuid; pos integer:=0;
 receipt public.workspace_commands%rowtype; reply jsonb; stage_ids uuid[]; old_kind text;
begin
 if actor is null or not private.is_company_member(p_company_id) then raise exception using errcode='42501',message='Empresa não autorizada.'; end if;
 if not exists(select 1 from public.memberships where company_id=p_company_id and user_id=actor and role='owner')
  and not exists(select 1 from public.aether_admins where user_id=actor) then
  raise exception using errcode='42501',message='Somente o proprietário ou administrador pode configurar o pipeline.';
 end if;
 if p_request_id is null or p_command->>'kind' is distinct from 'pipeline_configure' or jsonb_typeof(p_command->'stages') is distinct from 'array'
  or jsonb_array_length(p_command->'stages') not between 3 and 30 or length(p_command::text)>12000 then raise exception 'Configuração inválida.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_company_id::text||actor::text||p_request_id::text,0));
 select * into receipt from public.workspace_commands where company_id=p_company_id and actor_id=actor and request_id=p_request_id;
 if found then if receipt.command<>p_command then raise exception 'Identificador já utilizado.'; end if; return receipt.result; end if;
 select pipeline_version into v from public.companies where id=p_company_id for update;
 if (p_command->>'expectedVersion')::integer is distinct from v then raise exception 'O pipeline mudou. Atualize a tela antes de salvar.'; end if;
 if (select count(*) from jsonb_array_elements(p_command->'stages') x where x->>'kind'='won')<>1
  or (select count(*) from jsonb_array_elements(p_command->'stages') x where x->>'kind'='lost')<>1
  or not exists(select 1 from jsonb_array_elements(p_command->'stages') x where x->>'kind'='open') then
  raise exception 'Mantenha exatamente uma etapa de ganho, uma de perda e pelo menos uma aberta.';
 end if;
 select array_agg((x->>'id')::uuid) into stage_ids from jsonb_array_elements(p_command->'stages') x;
 if cardinality(stage_ids)<>(select count(distinct x) from unnest(stage_ids) x) or array_position(stage_ids,null) is not null then raise exception 'Etapas duplicadas ou sem identificador.'; end if;
 if exists(select 1 from public.pipeline_stages where id=any(stage_ids) and company_id<>p_company_id) then raise exception using errcode='42501',message='Etapa de outra empresa.'; end if;
 if exists(select 1 from public.opportunities where company_id=p_company_id and not stage_id=any(stage_ids)) then raise exception 'Uma etapa em uso não pode ser excluída. Mova suas oportunidades primeiro.'; end if;
 set constraints public.pipeline_stages_company_id_position_key deferred;
 delete from public.pipeline_stages where company_id=p_company_id and not id=any(stage_ids);
 for item in select value from jsonb_array_elements(p_command->'stages') loop
  sid:=(item->>'id')::uuid;
  if length(btrim(coalesce(item->>'name',''))) not between 1 and 100 or item->>'kind' not in ('open','won','lost') or item->>'kind' is null then raise exception 'Nome ou tipo de etapa inválido.'; end if;
  select kind into old_kind from public.pipeline_stages where company_id=p_company_id and id=sid;
  if found then
   if old_kind<>item->>'kind' and exists(select 1 from public.opportunities where company_id=p_company_id and stage_id=sid) then raise exception 'Não altere o tipo de uma etapa em uso.'; end if;
   update public.pipeline_stages set name=btrim(item->>'name'),kind=item->>'kind',position=pos where company_id=p_company_id and id=sid;
  else insert into public.pipeline_stages(id,company_id,name,kind,position) values(sid,p_company_id,btrim(item->>'name'),item->>'kind',pos); end if;
  pos:=pos+1;
 end loop;
 set constraints public.pipeline_stages_company_id_position_key immediate;
 update public.companies set pipeline_version=v+1 where id=p_company_id;
 reply:=jsonb_build_object('ok',true,'pipelineVersion',v+1);
 insert into public.workspace_commands(company_id,actor_id,request_id,command,result) values(p_company_id,actor,p_request_id,p_command,reply);
 return reply;
end $$;
revoke all on function public.configure_pipeline(uuid,uuid,jsonb) from public,anon;
grant execute on function public.configure_pipeline(uuid,uuid,jsonb) to authenticated;

create table public.product_feedback (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 context text not null check(length(context) between 1 and 120),
 message text not null check(length(btrim(message)) between 1 and 1000),
 state text not null default 'open' check(state in ('open','reviewed','resolved')),
 created_at timestamptz not null default now(),
 unique(user_id,request_id),
 foreign key(company_id,user_id) references public.memberships(company_id,user_id)
);
create index product_feedback_company_created on public.product_feedback(company_id,created_at desc);
create index product_feedback_user_created on public.product_feedback(user_id,created_at desc);
alter table public.product_feedback enable row level security;
create policy feedback_read on public.product_feedback for select to authenticated
 using((user_id=(select auth.uid()) and private.is_company_member(company_id)) or exists(select 1 from public.aether_admins where user_id=(select auth.uid())));
revoke all on public.product_feedback from anon,authenticated;
grant select on public.product_feedback to authenticated;
create function public.submit_product_feedback(p_company_id uuid,p_request_id uuid,p_context text,p_message text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); f public.product_feedback%rowtype;
begin
 if actor is null or not private.is_company_member(p_company_id) then raise exception using errcode='42501',message='Empresa não autorizada.'; end if;
 if p_request_id is null or length(btrim(coalesce(p_message,''))) not between 1 and 1000 or length(coalesce(p_context,'')) not between 1 and 120 then raise exception 'Informe o que você tentou fazer (até 1000 caracteres).'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||'feedback',0));
 select * into f from public.product_feedback where user_id=actor and request_id=p_request_id;
 if found then if f.company_id<>p_company_id or f.message<>btrim(p_message) or f.context<>p_context then raise exception 'Identificador já utilizado.'; end if; return jsonb_build_object('ok',true,'id',f.id); end if;
 if (select count(*) from public.product_feedback where user_id=actor and created_at>now()-interval '10 minutes')>=5 then raise exception 'Recebemos seus relatos. Aguarde alguns minutos para enviar outro.'; end if;
 insert into public.product_feedback(company_id,user_id,request_id,context,message) values(p_company_id,actor,p_request_id,p_context,btrim(p_message)) returning * into f;
 return jsonb_build_object('ok',true,'id',f.id);
end $$;
revoke all on function public.submit_product_feedback(uuid,uuid,text,text) from public,anon;
grant execute on function public.submit_product_feedback(uuid,uuid,text,text) to authenticated;

-- Existing self-service setup used multiple REST writes. Keep it atomic and repair
-- an owned incomplete workspace without changing its existing company/template.
create function public.ensure_owned_workspace(p_name text,p_template text,p_stages jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); c public.companies%rowtype; s jsonb; pos integer:=0;
begin
 if actor is null then raise exception using errcode='42501',message='Sessão ausente.'; end if;
 if length(btrim(coalesce(p_name,''))) not between 2 and 120
  or p_template is null or p_template not in ('generic','events','real_estate','hvac','marble','construction','furniture','dental','aesthetics','pools','equipment_rental','glass_aluminum')
  or jsonb_typeof(p_stages) is distinct from 'array' or jsonb_array_length(p_stages) not between 3 and 30 or length(p_stages::text)>10000 then raise exception 'Configuração inválida.'; end if;
 if (select count(*) from jsonb_array_elements(p_stages) x where x->>'kind'='won')<>1
  or (select count(*) from jsonb_array_elements(p_stages) x where x->>'kind'='lost')<>1
  or not exists(select 1 from jsonb_array_elements(p_stages) x where x->>'kind'='open') then raise exception 'Etapas inválidas.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||'owned_workspace',0));
 select co.* into c from public.companies co join public.memberships m on m.company_id=co.id
 where m.user_id=actor and not co.is_demo order by co.created_at limit 1;
 if found then
  if exists(select 1 from public.pipeline_stages where company_id=c.id) then
   if (select count(*) from public.pipeline_stages where company_id=c.id and kind='won')<>1
    or (select count(*) from public.pipeline_stages where company_id=c.id and kind='lost')<>1
    or not exists(select 1 from public.pipeline_stages where company_id=c.id and kind='open') then raise exception 'O pipeline existente precisa de revisão. Contate a Aether Works.'; end if;
   return jsonb_build_object('ok',true,'companyId',c.id,'name',c.name,'existing',true);
  end if;
  if c.owner_user_id is distinct from actor then raise exception 'A configuração desta empresa está incompleta. Contate o proprietário.'; end if;
 end if;
 select * into c from public.companies where owner_user_id=actor and not is_demo for update;
 if not found then insert into public.companies(name,company_template,is_demo,owner_user_id)
  values(btrim(p_name),p_template,false,actor) returning * into c;
 elsif c.company_template<>p_template then raise exception 'A configuração anterior usa outro segmento. Selecione esse segmento ou contate a Aether Works.'; end if;
 insert into public.memberships(company_id,user_id,role) values(c.id,actor,'owner') on conflict do nothing;
 if not exists(select 1 from public.pipeline_stages where company_id=c.id) then
  for s in select value from jsonb_array_elements(p_stages) loop
   if length(btrim(coalesce(s->>'name',''))) not between 1 and 100 or s->>'kind' is null or s->>'kind' not in ('open','won','lost') then raise exception 'Etapa inválida.'; end if;
   insert into public.pipeline_stages(company_id,name,kind,position) values(c.id,btrim(s->>'name'),s->>'kind',pos);pos:=pos+1;
  end loop;
 end if;
 return jsonb_build_object('ok',true,'companyId',c.id,'name',c.name);
end $$;
revoke all on function public.ensure_owned_workspace(text,text,jsonb) from public,anon;
grant execute on function public.ensure_owned_workspace(text,text,jsonb) to authenticated;
