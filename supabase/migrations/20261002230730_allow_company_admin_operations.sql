-- Company administrators may manage the operation catalog and movements.
-- Team and company creation remain owner-only in their existing RPCs.
alter table public.memberships drop constraint if exists memberships_role_check;
alter table public.memberships add constraint memberships_role_check check (role in ('owner','admin','manager','member'));
create or replace function private.is_company_manager(p_company_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.memberships where company_id=p_company_id and user_id=(select auth.uid()) and role in ('owner','admin','manager'));
$$;
revoke all on function private.is_company_manager(uuid) from public,anon;
grant execute on function private.is_company_manager(uuid) to authenticated;
