create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  company_template text not null default 'generic',
  is_demo boolean not null default false,
  demo_owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint demo_owner_required check (not is_demo or demo_owner_id is not null)
);
create unique index uq_demo_owner_template on public.companies(demo_owner_id,company_template) where is_demo;
create table public.memberships (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('owner','manager','member')),
  created_at timestamptz not null default now(),
  primary key(company_id,user_id)
);
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  position integer not null check(position >= 0),
  kind text not null default 'open' check(kind in ('open','won','lost')),
  unique(company_id,id), unique(company_id,position)
);
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check(length(trim(name)) between 1 and 100),
  phone text,
  organization text,
  created_at timestamptz not null default now(),
  unique(company_id,id)
);
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid not null,
  title text not null check(length(trim(title)) between 1 and 160),
  stage_id uuid not null,
  owner_id uuid not null,
  estimated_value numeric(14,2) check(estimated_value >= 0),
  next_action_type text,
  next_action_at timestamptz,
  next_action_note text,
  status text not null default 'open' check(status in ('open','won','lost')),
  source text, details text,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,id),
  foreign key(company_id,contact_id) references public.contacts(company_id,id),
  foreign key(company_id,stage_id) references public.pipeline_stages(company_id,id),
  foreign key(company_id,owner_id) references public.memberships(company_id,user_id)
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid not null,
  owner_id uuid not null,
  type text not null,
  due_at timestamptz not null,
  note text,
  status text not null default 'pending' check(status in ('pending','done','replaced')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key(company_id,opportunity_id) references public.opportunities(company_id,id),
  foreign key(company_id,owner_id) references public.memberships(company_id,user_id)
);
create unique index uq_one_pending_action on public.activities(company_id,opportunity_id) where status='pending';
create table public.opportunity_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  opportunity_id uuid not null,
  actor_id uuid not null references auth.users(id),
  event text not null,
  description text not null,
  created_at timestamptz not null default now(),
  foreign key(company_id,opportunity_id) references public.opportunities(company_id,id)
);
create table public.aether_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create index idx_opps_company_due on public.opportunities(company_id,status,next_action_at);
create index idx_opps_company_stage on public.opportunities(company_id,stage_id);
create index idx_activities_company_due on public.activities(company_id,status,due_at);
create index idx_history_company_opportunity on public.opportunity_history(company_id,opportunity_id,created_at desc);

create function private.is_company_member(p_company_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.memberships m
    where m.company_id=p_company_id and m.user_id=(select auth.uid())
  );
$$;
revoke all on function private.is_company_member(uuid) from public;
grant execute on function private.is_company_member(uuid) to authenticated;

create function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)));
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public;
create trigger on_aether_user_created after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.memberships enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;
alter table public.opportunity_history enable row level security;
alter table public.aether_admins enable row level security;

create policy profiles_read on public.profiles for select to authenticated using (
 id=(select auth.uid()) or exists (
  select 1 from public.memberships m where m.user_id=profiles.id and private.is_company_member(m.company_id)
 )
);
create policy profiles_update on public.profiles for update to authenticated
 using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy companies_read on public.companies for select to authenticated using(private.is_company_member(id));
create policy memberships_read on public.memberships for select to authenticated using(private.is_company_member(company_id));

create policy stages_read on public.pipeline_stages for select to authenticated using(private.is_company_member(company_id));
create policy stages_insert on public.pipeline_stages for insert to authenticated with check(private.is_company_member(company_id));
create policy stages_update on public.pipeline_stages for update to authenticated using(private.is_company_member(company_id)) with check(private.is_company_member(company_id));
create policy contacts_read on public.contacts for select to authenticated using(private.is_company_member(company_id));
create policy contacts_insert on public.contacts for insert to authenticated with check(private.is_company_member(company_id));
create policy contacts_update on public.contacts for update to authenticated using(private.is_company_member(company_id)) with check(private.is_company_member(company_id));
create policy opps_read on public.opportunities for select to authenticated using(private.is_company_member(company_id));
create policy opps_insert on public.opportunities for insert to authenticated with check(private.is_company_member(company_id));
create policy opps_update on public.opportunities for update to authenticated using(private.is_company_member(company_id)) with check(private.is_company_member(company_id));
create policy activities_read on public.activities for select to authenticated using(private.is_company_member(company_id));
create policy activities_insert on public.activities for insert to authenticated with check(private.is_company_member(company_id));
create policy activities_update on public.activities for update to authenticated using(private.is_company_member(company_id)) with check(private.is_company_member(company_id));
create policy history_read on public.opportunity_history for select to authenticated using(private.is_company_member(company_id));
create policy history_insert on public.opportunity_history for insert to authenticated with check(private.is_company_member(company_id) and actor_id=(select auth.uid()));

-- Authorization is controlled by RLS as well as these grants.
revoke all on all tables in schema public from anon;
grant select on public.profiles,public.companies,public.memberships,public.pipeline_stages,public.contacts,public.opportunities,public.activities,public.opportunity_history to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert,update on public.pipeline_stages,public.contacts,public.opportunities,public.activities to authenticated;
grant insert on public.opportunity_history to authenticated;
