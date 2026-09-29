create or replace function private.is_company_owner(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.companies c
      where c.id = p_company_id
        and c.is_demo = false
        and c.owner_user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_company_owner(uuid) from public, anon;
grant execute on function private.is_company_owner(uuid) to authenticated;

drop policy if exists memberships_insert_owned_workspace on public.memberships;
create policy memberships_insert_owned_workspace
on public.memberships
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and private.is_company_owner(company_id)
);
