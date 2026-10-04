create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  instance_name text not null unique,
  phone text,
  status text not null default 'connecting' check(status in ('connecting','open','close')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_whatsapp_connections_company on public.whatsapp_connections(company_id);
alter table public.whatsapp_connections enable row level security;
drop policy if exists whatsapp_connections_read on public.whatsapp_connections;
create policy whatsapp_connections_read on public.whatsapp_connections for select to authenticated using(private.is_company_member(company_id));
drop policy if exists whatsapp_connections_insert on public.whatsapp_connections;
create policy whatsapp_connections_insert on public.whatsapp_connections for insert to authenticated with check(private.is_company_member(company_id) and user_id=(select auth.uid()));
drop policy if exists whatsapp_connections_update on public.whatsapp_connections;
create policy whatsapp_connections_update on public.whatsapp_connections for update to authenticated using(private.is_company_member(company_id));
