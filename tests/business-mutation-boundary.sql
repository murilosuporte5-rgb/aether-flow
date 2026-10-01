-- Read-only boundary checks for the business-operations migration.
-- This runs against the disposable Supabase stack; it never creates fixtures.
do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.begin_admin_operation(text,uuid,uuid)',
    'public.admin_customer_catalog()',
    'public.admin_update_company(uuid,text,text)',
    'public.admin_review_feedback(uuid,text)',
    'public.import_opportunities(uuid,uuid,jsonb)'
  ] loop
    if has_function_privilege('anon',fn,'EXECUTE') then
      raise exception 'FAIL anonymous business RPC: %',fn;
    end if;
  end loop;
  if has_function_privilege('authenticated','public.provision_customer_workspace(uuid,uuid,text,text,jsonb)','EXECUTE') then
    raise exception 'FAIL provision workspace exposed to authenticated';
  end if;
  if has_table_privilege('anon','public.admin_operations','SELECT')
     or has_table_privilege('anon','public.csv_imports','SELECT') then
    raise exception 'FAIL anonymous access to business audit/import tables';
  end if;
  if not exists(select 1 from pg_trigger where tgname='company_write_guard' and tgrelid='public.opportunities'::regclass)
     or not exists(select 1 from pg_trigger where tgname='company_write_guard' and tgrelid='public.csv_imports'::regclass) then
    raise exception 'FAIL business write guards missing';
  end if;
end $$;

select jsonb_build_object(
  'status','PASS',
  'checks',array['anonymous_business_rpc_denied','provision_service_role_only','audit_import_tables_denied','business_write_guards_present']
) as business_mutation_boundary;
