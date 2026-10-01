-- Company-owned team management. A company owns its members; members cannot create companies.
create or replace function public.team_catalog(p_company_id uuid)
returns table(user_id uuid, email text, display_name text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = public, auth
as $$
begin
  if not private.is_company_member(p_company_id) then
    raise exception using errcode = '42501', message = 'Empresa não autorizada.';
  end if;
  return query
    select m.user_id, u.email::text, p.display_name, m.role, m.created_at
    from public.memberships m
    join auth.users u on u.id = m.user_id
    left join public.profiles p on p.id = m.user_id
    where m.company_id = p_company_id
    order by case m.role when 'owner' then 0 when 'manager' then 1 else 2 end, m.created_at;
end;
$$;

create or replace function public.team_add_member(p_company_id uuid, p_user_id uuid, p_display_name text, p_role text default 'member')
returns boolean language plpgsql security definer set search_path = public
as $$
declare current_role text; member_count integer;
begin
  select m.role into current_role from public.memberships m
    where m.company_id = p_company_id and m.user_id = (select auth.uid());
  if current_role <> 'owner' then raise exception using errcode = '42501', message = 'Somente o administrador da empresa pode gerir a equipe.'; end if;
  if p_role not in ('manager','member') then raise exception 'Função inválida.'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_company_id::text || 'team', 0));
  select count(*) into member_count from public.memberships where company_id = p_company_id;
  if member_count >= 4 then raise exception 'O plano atual permite até 3 funcionários além do administrador.'; end if;
  if exists(select 1 from public.memberships where company_id = p_company_id and user_id = p_user_id) then
    raise exception 'Este usuário já pertence à empresa.';
  end if;
  insert into public.memberships(company_id,user_id,role) values(p_company_id,p_user_id,p_role);
  if nullif(btrim(coalesce(p_display_name,'')),'') is not null then
    update public.profiles set display_name = left(btrim(p_display_name),100) where id = p_user_id;
  end if;
  return true;
end;
$$;

create or replace function public.team_set_role(p_company_id uuid, p_user_id uuid, p_role text)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not exists(select 1 from public.memberships where company_id=p_company_id and user_id=(select auth.uid()) and role='owner') then
    raise exception using errcode = '42501', message = 'Somente o administrador da empresa pode gerir a equipe.';
  end if;
  if p_role not in ('manager','member') then raise exception 'Função inválida.'; end if;
  update public.memberships set role=p_role where company_id=p_company_id and user_id=p_user_id and role <> 'owner';
  if not found then raise exception 'Membro não encontrado ou protegido.'; end if;
  return true;
end;
$$;

create or replace function public.team_remove_member(p_company_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not exists(select 1 from public.memberships where company_id=p_company_id and user_id=(select auth.uid()) and role='owner') then
    raise exception using errcode = '42501', message = 'Somente o administrador da empresa pode gerir a equipe.';
  end if;
  delete from public.memberships where company_id=p_company_id and user_id=p_user_id and role <> 'owner';
  if not found then raise exception 'Membro não encontrado ou protegido.'; end if;
  return true;
end;
$$;

revoke all on function public.team_catalog(uuid), public.team_add_member(uuid,uuid,text,text), public.team_set_role(uuid,uuid,text), public.team_remove_member(uuid,uuid) from public, anon;
grant execute on function public.team_catalog(uuid), public.team_add_member(uuid,uuid,text,text), public.team_set_role(uuid,uuid,text), public.team_remove_member(uuid,uuid) to authenticated;
