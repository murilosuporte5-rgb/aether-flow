create table if not exists public.whatsapp_captures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  connection_id uuid references public.whatsapp_connections(id) on delete set null,
  name text not null,
  phone text not null,
  conversation text not null default '',
  source text not null default 'WhatsApp automático',
  status text not null default 'pending' check (status in ('pending', 'lead', 'not_lead')),
  opportunity_id uuid references public.opportunities(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_whatsapp_captures_company_status_created
  on public.whatsapp_captures(company_id, status, created_at desc);

create unique index if not exists idx_whatsapp_captures_one_pending_phone
  on public.whatsapp_captures(company_id, phone) where status = 'pending';

alter table public.whatsapp_captures enable row level security;
drop policy if exists whatsapp_captures_read on public.whatsapp_captures;
create policy whatsapp_captures_read on public.whatsapp_captures
  for select to authenticated using (private.is_company_member(company_id));
drop policy if exists whatsapp_captures_insert on public.whatsapp_captures;
create policy whatsapp_captures_insert on public.whatsapp_captures
  for insert to authenticated with check (private.is_company_member(company_id));
drop policy if exists whatsapp_captures_update on public.whatsapp_captures;
create policy whatsapp_captures_update on public.whatsapp_captures
  for update to authenticated
  using (private.is_company_member(company_id))
  with check (private.is_company_member(company_id));

revoke all on public.whatsapp_captures from anon;
grant select, insert, update on public.whatsapp_captures to authenticated;
