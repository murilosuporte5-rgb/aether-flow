alter table public.companies
add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

update public.companies c
set owner_user_id = m.user_id
from public.memberships m
where c.id = m.company_id
  and c.is_demo = false
  and c.owner_user_id is null
  and m.role = 'owner';

create unique index if not exists companies_one_owned_workspace_per_user
on public.companies(owner_user_id)
where is_demo = false and owner_user_id is not null;

drop policy if exists companies_read on public.companies;
create policy companies_read
on public.companies
for select
to authenticated
using (
  private.is_company_member(id)
  or (is_demo = true and demo_owner_id = (select auth.uid()))
  or (is_demo = false and owner_user_id = (select auth.uid()))
);

drop policy if exists companies_insert_own_workspace on public.companies;
create policy companies_insert_own_workspace
on public.companies
for insert
to authenticated
with check (
  is_demo = false
  and owner_user_id = (select auth.uid())
);

drop policy if exists memberships_insert_owned_workspace on public.memberships;
create policy memberships_insert_owned_workspace
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
      and c.is_demo = false
      and c.owner_user_id = (select auth.uid())
  )
);
