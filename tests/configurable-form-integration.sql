-- Disposable database with company-branding-integration.sql fixtures. Writes roll back.
begin;
insert into public.pipeline_stages(company_id,name,position,kind) values
('20000000-0000-4000-8000-000000000001','Novo',0,'open'),
('20000000-0000-4000-8000-000000000001','Ganho',1,'won'),
('20000000-0000-4000-8000-000000000001','Perdido',2,'lost');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.contact_field_definitions(company_id,field_key,label,field_type) values
('20000000-0000-4000-8000-000000000001','segmento','Segmento','text');
do $$
declare
  ca uuid:='20000000-0000-4000-8000-000000000001';
  cb uuid:='20000000-0000-4000-8000-000000000002';
  stage_a uuid; request_id uuid:=gen_random_uuid(); command jsonb; result jsonb; contact_a uuid; denied boolean:=false;
begin
  select id into stage_a from public.pipeline_stages where company_id=ca and position=0;
  command:=jsonb_build_object('kind','create','contactName','Cliente formulário','phone','71977776666',
    'title','Proposta formulário','stageId',stage_a,'customData',jsonb_build_object('segmento','Varejo'));
  result:=public.create_opportunity_with_contact_fields(ca,request_id,command);
  select contact_id into contact_a from public.opportunities where id=(result->>'id')::uuid;
  if (result->>'ok')::boolean is distinct from true or
    (select custom_data->>'segmento' from public.contacts where id=contact_a)<>'Varejo' then
    raise exception 'Configurable form failed to save the contact field atomically';
  end if;
  if public.create_opportunity_with_contact_fields(ca,request_id,command)<>result
    or (select count(*) from public.opportunities where company_id=ca)<>1 then
    raise exception 'Configurable form idempotency failed';
  end if;
  begin
    perform public.create_opportunity_with_contact_fields(ca,request_id,command||'{"customData":{"segmento":"Outro"}}'::jsonb);
  exception when others then denied:=true;
  end;
  if not denied then raise exception 'Changed form replay was accepted'; end if;
  denied:=false;
  begin
    perform public.create_opportunity_with_contact_fields(ca,gen_random_uuid(),command||
      jsonb_build_object('phone','71977775555','customData',jsonb_build_object('nao_existe','x')));
  exception when others then denied:=true;
  end;
  if not denied or (select count(*) from public.opportunities where company_id=ca)<>1 then
    raise exception 'Invalid field did not roll back opportunity creation';
  end if;
  denied:=false;
  begin
    perform public.create_opportunity_with_contact_fields(cb,gen_random_uuid(),command);
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Cross-company form creation was allowed'; end if;
end $$;
rollback;
