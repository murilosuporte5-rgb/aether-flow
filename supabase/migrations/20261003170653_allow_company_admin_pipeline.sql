-- Allow a company admin to manage only that company pipeline.
create or replace function public.configure_pipeline(p_company_id uuid,p_request_id uuid,p_command jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); v integer; item jsonb; sid uuid; pos integer:=0;
 receipt public.workspace_commands%rowtype; reply jsonb; stage_ids uuid[]; old_kind text;
begin
 if actor is null or not private.is_company_member(p_company_id) then raise exception using errcode='42501',message='Empresa não autorizada.'; end if;
 if not exists(select 1 from public.memberships where company_id=p_company_id and user_id=actor and role in ('owner','admin'))
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

