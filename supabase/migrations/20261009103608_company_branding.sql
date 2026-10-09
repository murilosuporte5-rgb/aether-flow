-- Brand preferences belong to one company and can only be changed by its owners/admins.
create table public.company_branding (
  company_id uuid primary key references public.companies(id) on delete cascade,
  accent_color text not null default '#2457a5'
    check (accent_color in ('#2457a5', '#216f78', '#216d51', '#684c95', '#8f3e5c')),
  updated_at timestamptz not null default now()
);

alter table public.company_branding enable row level security;

create policy "Company members can read branding" on public.company_branding
  for select to authenticated
  using ((select private.is_company_member(company_id)));

create policy "Company admins can create branding" on public.company_branding
  for insert to authenticated
  with check (exists (
    select 1 from public.memberships
    where company_id = company_branding.company_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  ));

create policy "Company admins can update branding" on public.company_branding
  for update to authenticated
  using (exists (
    select 1 from public.memberships
    where company_id = company_branding.company_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  ))
  with check (exists (
    select 1 from public.memberships
    where company_id = company_branding.company_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  ));

revoke all on public.company_branding from anon;
grant select, insert, update on public.company_branding to authenticated;
