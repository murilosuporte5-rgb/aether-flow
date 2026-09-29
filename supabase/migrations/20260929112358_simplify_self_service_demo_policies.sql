drop policy if exists companies_read on public.companies;
create policy companies_read
on public.companies
for select
to authenticated
using (
  private.is_company_member(id)
  or (is_demo = true and demo_owner_id = (select auth.uid()))
);

drop policy if exists companies_insert_admin_demo on public.companies;
drop policy if exists companies_insert_own_demo on public.companies;
create policy companies_insert_own_demo
on public.companies
for insert
to authenticated
with check (
  is_demo = true
  and demo_owner_id = (select auth.uid())
);

drop policy if exists memberships_insert_admin_demo on public.memberships;
drop policy if exists memberships_insert_own_demo on public.memberships;
create policy memberships_insert_own_demo
on public.memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1
    from public.companies c
    where c.id = memberships.company_id
      and c.is_demo = true
      and c.demo_owner_id = (select auth.uid())
  )
);

drop function if exists private.can_claim_demo_company(uuid);
