-- Disposable PostgreSQL fixture for testing the app's SQL without a Supabase service.
-- Only auth.uid() and the auth.users columns referenced by these migrations are emulated.
-- Run on an empty local database, never on a hosted project.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;
create schema auth;
create schema extensions;
create extension pgcrypto with schema extensions;

create table auth.users (
  id uuid primary key,
  email text not null unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  last_sign_in_at timestamptz
);

create function auth.uid() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

grant usage on schema auth, extensions to authenticated, service_role;
grant usage on schema public to authenticated, service_role;
grant select on auth.users to authenticated;
