drop policy if exists companies_read on public.companies;
create policy companies_read
on public.companies
for select
to authenticated
using (
  private.is_company_member(id)
  or (
    is_demo = true
    and demo_owner_id = (select auth.uid())
    and private.is_aether_admin()
  )
);
