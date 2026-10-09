create table public.contact_field_definitions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  field_key text not null check (field_key ~ '^[a-z][a-z0-9_]{0,31}$'),
  label text not null check (length(btrim(label)) between 1 and 50),
  field_type text not null check (field_type in ('text','number','date')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id,field_key), unique(company_id,id)
);
create index contact_field_definitions_company on public.contact_field_definitions(company_id,created_at);
alter table public.contact_field_definitions enable row level security;
create policy "Members read contact fields" on public.contact_field_definitions
  for select to authenticated using (private.is_company_member(company_id));
create policy "Admins create contact fields" on public.contact_field_definitions
  for insert to authenticated with check (exists (
    select 1 from public.memberships where company_id=contact_field_definitions.company_id
      and user_id=(select auth.uid()) and role in ('owner','admin')
  ));
create policy "Admins update contact fields" on public.contact_field_definitions
  for update to authenticated
  using (exists (
    select 1 from public.memberships where company_id=contact_field_definitions.company_id
      and user_id=(select auth.uid()) and role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.memberships where company_id=contact_field_definitions.company_id
      and user_id=(select auth.uid()) and role in ('owner','admin')
  ));
revoke all on public.contact_field_definitions from anon;
grant select,insert,update on public.contact_field_definitions to authenticated;

create function private.limit_contact_fields() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.active and (select count(*) from public.contact_field_definitions
    where company_id=new.company_id and active and id<>new.id)>=20 then
    raise exception 'Limite de 20 campos ativos por empresa.';
  end if;
  return new;
end $$;
revoke all on function private.limit_contact_fields() from public,anon,authenticated;
create trigger limit_contact_fields before insert or update on public.contact_field_definitions
  for each row execute function private.limit_contact_fields();

alter table public.contacts add column custom_data jsonb not null default '{}'::jsonb
  check (jsonb_typeof(custom_data)='object' and length(custom_data::text)<=5000);

create function private.validate_contact_custom_data() returns trigger
language plpgsql security definer set search_path='' as $$
declare item record; kind text; scalar text;
begin
  if (select count(*) from jsonb_object_keys(new.custom_data))>20 then raise exception 'Limite de 20 valores personalizados.'; end if;
  for item in select key,value from jsonb_each(new.custom_data) loop
    select field_type into kind from public.contact_field_definitions
      where company_id=new.company_id and field_key=item.key and active;
    if kind is null then
      if tg_op='UPDATE' and old.custom_data->item.key=item.value then continue; end if;
      raise exception 'Campo personalizado não disponível: %',item.key;
    end if;
    scalar:=item.value #>> '{}';
    if kind='text' and (jsonb_typeof(item.value)<>'string' or length(btrim(scalar)) not between 1 and 200) then
      raise exception 'Texto inválido para %',item.key;
    elsif kind='number' and (jsonb_typeof(item.value)<>'number' or abs(scalar::numeric)>1000000000000) then
      raise exception 'Número inválido para %',item.key;
    elsif kind='date' then
      if jsonb_typeof(item.value)<>'string' or scalar !~ '^\d{4}-\d{2}-\d{2}$'
        or to_char(scalar::date,'YYYY-MM-DD')<>scalar then
        raise exception 'Data inválida para %',item.key;
      end if;
    end if;
    kind:=null;
  end loop;
  return new;
end $$;
revoke all on function private.validate_contact_custom_data() from public,anon,authenticated;
create trigger validate_contact_custom_data before insert or update of custom_data on public.contacts
  for each row execute function private.validate_contact_custom_data();
