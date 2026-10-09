-- Run on the disposable database after company-branding-integration.sql.
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.message_templates(company_id,name,body,created_by) values
('20000000-0000-4000-8000-000000000001','Teste de módulo','Olá {nome}',(select auth.uid()));
insert into public.company_modules(company_id,module_key,enabled)
values('20000000-0000-4000-8000-000000000001','messages',false);
do $$
begin
  if private.is_company_module_enabled('20000000-0000-4000-8000-000000000001','messages') then
    raise exception 'Disabled module reported enabled';
  end if;
  if exists(select 1 from public.message_templates where company_id='20000000-0000-4000-8000-000000000001') then
    raise exception 'Disabled message templates are readable';
  end if;
  begin
    insert into public.message_templates(company_id,name,body,created_by) values
    ('20000000-0000-4000-8000-000000000001','Bloqueado','Sem acesso',(select auth.uid()));
    raise exception 'Disabled module allowed write';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ declare changed integer;
begin
  if (select enabled from public.company_modules where company_id='20000000-0000-4000-8000-000000000001' and module_key='messages') is distinct from false then
    raise exception 'Member cannot read module setting';
  end if;
  update public.company_modules set enabled=true where company_id='20000000-0000-4000-8000-000000000001' and module_key='messages';
  get diagnostics changed=row_count;
  if changed<>0 then raise exception 'Member updated module setting'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
do $$ begin
  if exists(select 1 from public.company_modules where company_id='20000000-0000-4000-8000-000000000001') then
    raise exception 'Owner B can read A module setting';
  end if;
  if private.is_company_module_enabled('20000000-0000-4000-8000-000000000001','messages') then
    raise exception 'Module status leaked to another company';
  end if;
  if not private.is_company_module_enabled('20000000-0000-4000-8000-000000000002','messages') then
    raise exception 'Existing company default should remain enabled';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
update public.company_modules set enabled=true where company_id='20000000-0000-4000-8000-000000000001' and module_key='messages';
do $$ begin
  if (select count(*) from public.message_templates where company_id='20000000-0000-4000-8000-000000000001')<>1 then
    raise exception 'Saved messages were not restored when re-enabled';
  end if;
end $$;
update public.company_modules set enabled=false where company_id='20000000-0000-4000-8000-000000000001' and module_key='messages';
commit;
