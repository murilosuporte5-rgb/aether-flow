-- One row per optional module. A missing row means enabled for existing customers.
create table public.company_modules (
  company_id uuid not null references public.companies(id) on delete cascade,
  module_key text not null check (module_key in ('messages')),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (company_id,module_key)
);

alter table public.company_modules enable row level security;
create policy "Members read company modules" on public.company_modules
  for select to authenticated using ((select private.is_company_member(company_id)));
create policy "Admins create company modules" on public.company_modules
  for insert to authenticated with check (exists (
    select 1 from public.memberships
    where company_id=company_modules.company_id and user_id=(select auth.uid())
      and role in ('owner','admin')
  ));
create policy "Admins update company modules" on public.company_modules
  for update to authenticated
  using (exists (
    select 1 from public.memberships
    where company_id=company_modules.company_id and user_id=(select auth.uid())
      and role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.memberships
    where company_id=company_modules.company_id and user_id=(select auth.uid())
      and role in ('owner','admin')
  ));

revoke all on public.company_modules from anon;
grant select,insert,update on public.company_modules to authenticated;
