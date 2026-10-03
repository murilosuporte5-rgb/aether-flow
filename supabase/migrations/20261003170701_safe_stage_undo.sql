create or replace function public.undo_stage_change(
  p_company_id uuid,
  p_request_id uuid,
  p_opportunity_id uuid,
  p_expected_stage_id uuid,
  p_previous_stage_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  current_stage uuid;
  current_kind text;
  previous_kind text;
  receipt public.workspace_commands%rowtype;
  reply jsonb := jsonb_build_object('ok', true, 'id', p_opportunity_id);
begin
  if actor is null or not private.is_company_member(p_company_id) then
    raise exception using errcode='42501', message='Empresa não autorizada.';
  end if;
  if p_request_id is null or p_opportunity_id is null or p_expected_stage_id is null or p_previous_stage_id is null then
    raise exception 'Dados de Undo inválidos.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_company_id::text||actor::text||p_request_id::text,0));
  select * into receipt from public.workspace_commands
    where company_id=p_company_id and actor_id=actor and request_id=p_request_id;
  if found then return receipt.result; end if;
  select o.stage_id, st_current.kind into current_stage, current_kind
    from public.opportunities o
    join public.pipeline_stages st_current on st_current.id=o.stage_id and st_current.company_id=p_company_id
    where o.company_id=p_company_id and o.id=p_opportunity_id and o.status='open'
    for update;
  if current_stage is null or current_stage <> p_expected_stage_id or current_kind <> 'open' then
    raise exception 'A oportunidade mudou. Atualize a tela antes de desfazer.';
  end if;
  select kind into previous_kind from public.pipeline_stages
    where company_id=p_company_id and id=p_previous_stage_id;
  if previous_kind is distinct from 'open' then
    raise exception 'Só é possível desfazer uma mudança entre etapas abertas.';
  end if;
  update public.opportunities
    set stage_id=p_previous_stage_id, status='open', updated_at=now()
    where company_id=p_company_id and id=p_opportunity_id and stage_id=p_expected_stage_id;
  if not found then raise exception 'A oportunidade mudou. Atualize a tela antes de desfazer.'; end if;
  perform private.append_opportunity_event(
    p_company_id, p_opportunity_id, 'stage_undone', 'Mudança de etapa desfeita',
    jsonb_build_object('from', p_expected_stage_id, 'to', p_previous_stage_id)
  );
  insert into public.workspace_commands(company_id,actor_id,request_id,command,result)
    values (p_company_id, actor, p_request_id,
      jsonb_build_object('kind','undo_stage','id',p_opportunity_id,'expectedStageId',p_expected_stage_id,'previousStageId',p_previous_stage_id), reply);
  return reply;
end
$$;

revoke all on function public.undo_stage_change(uuid,uuid,uuid,uuid,uuid) from public, anon;
grant execute on function public.undo_stage_change(uuid,uuid,uuid,uuid,uuid) to authenticated;
