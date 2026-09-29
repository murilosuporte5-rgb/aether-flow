drop function if exists public.claim_initial_admin(text);

alter table private.admin_bootstrap disable row level security;
grant usage on schema private to authenticated;
grant select (id, secret_hash, consumed_at) on private.admin_bootstrap to authenticated;

create table if not exists public.admin_bootstrap_claims (
  user_id uuid primary key references auth.users(id) on delete cascade,
  claim_key text not null check (length(claim_key) >= 20),
  created_at timestamptz not null default now()
);

alter table public.admin_bootstrap_claims enable row level security;
revoke all on table public.admin_bootstrap_claims from public, anon;
grant insert on table public.admin_bootstrap_claims to authenticated;

drop policy if exists admin_bootstrap_claim_insert on public.admin_bootstrap_claims;
create policy admin_bootstrap_claim_insert
on public.admin_bootstrap_claims
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from private.admin_bootstrap b
    where b.id = true
      and b.consumed_at is null
      and encode(extensions.digest(claim_key, 'sha256'), 'hex') = b.secret_hash
  )
);

create or replace function private.finalize_admin_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare
  cfg private.admin_bootstrap%rowtype;
begin
  select * into cfg
  from private.admin_bootstrap
  where id = true
  for update;

  if not found
     or cfg.consumed_at is not null
     or encode(extensions.digest(new.claim_key, 'sha256'), 'hex') <> cfg.secret_hash
     or exists (select 1 from public.aether_admins) then
    raise exception 'admin bootstrap unavailable';
  end if;

  insert into public.aether_admins(user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  update private.admin_bootstrap
  set consumed_at = now()
  where id = true;

  delete from public.admin_bootstrap_claims
  where user_id = new.user_id;

  return new;
end;
$$;

revoke all on function private.finalize_admin_bootstrap() from public, anon, authenticated;

drop trigger if exists finalize_admin_bootstrap on public.admin_bootstrap_claims;
create trigger finalize_admin_bootstrap
after insert on public.admin_bootstrap_claims
for each row execute function private.finalize_admin_bootstrap();
