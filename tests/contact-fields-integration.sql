-- Disposable database with company-branding-integration.sql fixtures. Writes roll back.
begin;
insert into public.pipeline_stages(company_id,name,position,kind) values
('20000000-0000-4000-8000-000000000001','Novo',0,'open'),
('20000000-0000-4000-8000-000000000001','Ganho',1,'won'),
('20000000-0000-4000-8000-000000000001','Perdido',2,'lost');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.contact_field_definitions(company_id,field_key,label,field_type) values
('20000000-0000-4000-8000-000000000001','segmento','Segmento','text'),
('20000000-0000-4000-8000-000000000001','tamanho','Tamanho','number'),
('20000000-0000-4000-8000-000000000001','renovacao','Renovação','date');
do $$
declare ca uuid:='20000000-0000-4000-8000-000000000001'; stage_a uuid; result jsonb; contact_a uuid;
begin
  select id into stage_a from public.pipeline_stages where company_id=ca and position=0;
  result:=public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object(
    'kind','create','contactName','Cliente campos','phone','71988887777','title','Contrato','stageId',stage_a
  ));
  if (result->>'ok')::boolean is distinct from true then raise exception 'Contact creation failed: %',result; end if;
  select contact_id into contact_a from public.opportunities where id=(result->>'id')::uuid;
  perform set_config('aether_test.contact_id',contact_a::text,true);
  perform public.set_contact_custom_field(ca,contact_a,'segmento',to_jsonb('Varejo'::text));
  perform public.set_contact_custom_field(ca,contact_a,'tamanho',to_jsonb(15));
  perform public.set_contact_custom_field(ca,contact_a,'renovacao',to_jsonb('2026-12-10'::text));
  if (select custom_data from public.contacts where id=contact_a) <>
    '{"segmento":"Varejo","tamanho":15,"renovacao":"2026-12-10"}'::jsonb then
    raise exception 'Custom fields did not persist';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$
declare ca uuid:='20000000-0000-4000-8000-000000000001'; contact_a uuid:=current_setting('aether_test.contact_id')::uuid; denied boolean:=false;
begin
  if (select custom_data->>'segmento' from public.contacts where id=contact_a)<>'Varejo' then
    raise exception 'Member cannot read custom field';
  end if;
  perform public.set_contact_custom_field(ca,contact_a,'segmento',to_jsonb('Serviços'::text));
  begin
    perform public.set_contact_custom_field(ca,contact_a,'renovacao',to_jsonb('2026-02-30'::text));
  exception when others then denied:=true;
  end;
  if not denied then raise exception 'Invalid calendar date accepted'; end if;
  denied:=false;
  begin
    perform public.set_contact_custom_field(ca,contact_a,'nao_existe',to_jsonb('x'::text));
  exception when others then denied:=true;
  end;
  if not denied then raise exception 'Unknown field accepted'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
do $$
declare ca uuid:='20000000-0000-4000-8000-000000000001'; contact_a uuid:=current_setting('aether_test.contact_id')::uuid; denied boolean:=false;
begin
  if exists(select 1 from public.contacts where id=contact_a)
     or exists(select 1 from public.contact_field_definitions where company_id=ca) then
    raise exception 'Company B can read company A fields';
  end if;
  begin
    perform public.set_contact_custom_field(ca,contact_a,'segmento',to_jsonb('Intruso'::text));
  exception when insufficient_privilege then denied:=true;
  end;
  if not denied then raise exception 'Company B wrote company A field'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
update public.contact_field_definitions set active=false where company_id='20000000-0000-4000-8000-000000000001' and field_key='segmento';
do $$
declare ca uuid:='20000000-0000-4000-8000-000000000001'; contact_a uuid:=current_setting('aether_test.contact_id')::uuid; denied boolean:=false;
begin
  perform public.set_contact_custom_field(ca,contact_a,'tamanho',to_jsonb(20));
  if (select custom_data->>'segmento' from public.contacts where id=contact_a)<>'Serviços' then
    raise exception 'Inactive field value was lost';
  end if;
  begin
    perform public.set_contact_custom_field(ca,contact_a,'segmento',to_jsonb('Alterado'::text));
  exception when others then denied:=true;
  end;
  if not denied then raise exception 'Inactive field was editable'; end if;
end $$;
rollback;
