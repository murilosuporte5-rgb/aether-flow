create table if not exists private.admin_bootstrap (
  id boolean primary key default true check (id),
  secret_hash text not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table private.admin_bootstrap enable row level security;
revoke all on table private.admin_bootstrap from public, anon, authenticated;

create or replace function public.claim_initial_admin(claim_key text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public, private, extensions
as $$
declare
  caller uuid := auth.uid();
  cfg private.admin_bootstrap%rowtype;
begin
  if caller is null or claim_key is null or length(claim_key) < 20 then
    return false;
  end if;

  if exists (select 1 from public.aether_admins) then
    return exists (select 1 from public.aether_admins where user_id = caller);
  end if;

  select * into cfg
  from private.admin_bootstrap
  where id = true
  for update;

  if not found or cfg.consumed_at is not null then
    return false;
  end if;

  if encode(extensions.digest(claim_key, 'sha256'), 'hex') <> cfg.secret_hash then
    return false;
  end if;

  insert into public.aether_admins(user_id)
  values (caller)
  on conflict (user_id) do nothing;

  update private.admin_bootstrap
  set consumed_at = now()
  where id = true;

  return true;
end;
$$;

revoke all on function public.claim_initial_admin(text) from public, anon;
grant execute on function public.claim_initial_admin(text) to authenticated;
