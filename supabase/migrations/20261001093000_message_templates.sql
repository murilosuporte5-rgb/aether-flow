create table public.message_templates(
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id) on delete cascade,
 name text not null check(length(btrim(name)) between 1 and 80),
 body text not null check(length(btrim(body)) between 1 and 1000),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.message_templates enable row level security;
revoke all on public.message_templates from anon;
grant select,insert,update,delete on public.message_templates to authenticated;
create policy message_templates_read on public.message_templates for select to authenticated
 using(private.is_company_member(company_id));
create policy message_templates_insert on public.message_templates for insert to authenticated
 with check(private.is_company_member(company_id) and created_by=(select auth.uid()));
create policy message_templates_update on public.message_templates for update to authenticated
 using(private.is_company_member(company_id))
 with check(private.is_company_member(company_id));
create policy message_templates_delete on public.message_templates for delete to authenticated
 using(private.is_company_member(company_id));
create index message_templates_company_created on public.message_templates(company_id,created_at desc);
create trigger message_templates_write_guard before insert or update on public.message_templates
 for each row execute function private.guard_company_write();
create function private.message_templates_touch() returns trigger
language plpgsql set search_path='' as $$
begin new.updated_at:=statement_timestamp(); return new; end $$;
revoke all on function private.message_templates_touch() from public,anon,authenticated;
create trigger message_templates_updated_at before update on public.message_templates
 for each row execute function private.message_templates_touch();
