-- Run against a disposable local Supabase database after applying migrations.
do $$
begin
  if not (select relrowsecurity from pg_class where oid = 'public.company_branding'::regclass) then
    raise exception 'Company branding must use RLS';
  end if;
  if has_table_privilege('anon', 'public.company_branding', 'SELECT')
    or has_table_privilege('anon', 'public.company_branding', 'INSERT')
    or has_table_privilege('anon', 'public.company_branding', 'UPDATE') then
    raise exception 'Anonymous access to company branding is forbidden';
  end if;
  if has_table_privilege('authenticated', 'public.company_branding', 'DELETE') then
    raise exception 'Deleting company branding is forbidden';
  end if;
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'company_branding') <> 3 then
    raise exception 'Company branding policies missing';
  end if;
end $$;
