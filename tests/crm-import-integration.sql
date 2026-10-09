-- Real PostgreSQL RPC test on the disposable two-company fixture. All writes roll back.
begin;
insert into public.pipeline_stages(company_id,name,position,kind) values
('20000000-0000-4000-8000-000000000001','Novo',0,'open'),
('20000000-0000-4000-8000-000000000001','Contato',1,'open'),
('20000000-0000-4000-8000-000000000001','Ganho',2,'won'),
('20000000-0000-4000-8000-000000000001','Perdido',3,'lost'),
('20000000-0000-4000-8000-000000000002','Novo',0,'open'),
('20000000-0000-4000-8000-000000000002','Ganho',1,'won'),
('20000000-0000-4000-8000-000000000002','Perdido',2,'lost');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$
declare
  ca uuid:='20000000-0000-4000-8000-000000000001';
  cb uuid:='20000000-0000-4000-8000-000000000002';
  stage_a uuid;
  stage_next uuid;
  opportunity_a uuid;
  result jsonb;
  denied boolean:=false;
begin
  select id into stage_a from public.pipeline_stages where company_id=ca and position=0;
  select id into stage_next from public.pipeline_stages where company_id=ca and position=1;
  result:=public.import_opportunities(ca,gen_random_uuid(),jsonb_build_array(
    jsonb_build_object('contactName','Cliente CSV','phone','(71) 99999-1234','title','Pedido 1','stageId',stage_a),
    jsonb_build_object('contactName','Cliente CSV','phone','71999991234','title','Pedido 2','stageId',stage_a)
  ));
  if (result->>'imported')::integer<>2 or (result->>'contactsReused')::integer<>1 then
    raise exception 'CSV import count or deduplication failed: %',result;
  end if;
  if (select count(*) from public.contacts where company_id=ca)<>1
    or (select count(*) from public.opportunities where company_id=ca)<>2
    or (select count(*) from public.opportunity_history where company_id=ca and event='created')<>2 then
    raise exception 'CSV import did not persist contacts, opportunities, and history';
  end if;
  select id into opportunity_a from public.opportunities where company_id=ca order by created_at,id limit 1;
  perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','stage','id',opportunity_a,'stageId',stage_next));
  if (select stage_id from public.opportunities where id=opportunity_a)<>stage_next
    or not exists(select 1 from public.opportunity_history where opportunity_id=opportunity_a and event='stage_changed') then
    raise exception 'Pipeline move or history persistence failed';
  end if;
  begin
    perform public.import_opportunities(cb,gen_random_uuid(),jsonb_build_array(
      jsonb_build_object('contactName','Intruso','phone','71999991234','title','Não permitido','stageId',stage_a)
    ));
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Cross-company CSV import was allowed'; end if;
end $$;
rollback;
