create or replace function private.is_aether_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.aether_admins a
      where a.user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_aether_admin() from public;
grant execute on function private.is_aether_admin() to authenticated;

create or replace function private.can_claim_demo_company(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.aether_admins a
      join public.companies c
        on c.id = p_company_id
       and c.is_demo = true
       and c.demo_owner_id = (select auth.uid())
      where a.user_id = (select auth.uid())
    );
$$;

revoke all on function private.can_claim_demo_company(uuid) from public;
grant execute on function private.can_claim_demo_company(uuid) to authenticated;

drop policy if exists aether_admins_read_self on public.aether_admins;
create policy aether_admins_read_self
on public.aether_admins
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists companies_insert_admin_demo on public.companies;
create policy companies_insert_admin_demo
on public.companies
for insert
to authenticated
with check (
  is_demo = true
  and demo_owner_id = (select auth.uid())
  and private.is_aether_admin()
);

drop policy if exists memberships_insert_admin_demo on public.memberships;
create policy memberships_insert_admin_demo
on public.memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and private.can_claim_demo_company(company_id)
);

grant insert on public.companies, public.memberships to authenticated;
