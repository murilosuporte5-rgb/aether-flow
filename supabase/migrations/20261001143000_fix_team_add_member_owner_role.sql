-- Avoid the reserved CURRENT_ROLE identifier when checking the company owner.
create or replace function public.team_add_member(p_company_id uuid, p_user_id uuid, p_display_name text, p_role text default 'member')
returns boolean language plpgsql security definer set search_path = public
as $$
declare actor_role text; member_count integer;
begin
  select m.role into actor_role from public.memberships m
    where m.company_id = p_company_id and m.user_id = (select auth.uid());
  if actor_role <> 'owner' then raise exception using errcode = '42501', message = 'Somente o administrador da empresa pode gerir a equipe.'; end if;
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
revoke all on function public.team_add_member(uuid,uuid,text,text) from public, anon;
grant execute on function public.team_add_member(uuid,uuid,text,text) to authenticated;
