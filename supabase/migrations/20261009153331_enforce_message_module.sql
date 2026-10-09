create function private.is_company_module_enabled(p_company_id uuid,p_module_key text)
returns boolean language sql stable security definer set search_path='' as $$
  select private.is_company_member(p_company_id)
    and coalesce((select enabled from public.company_modules
      where company_id=p_company_id and module_key=p_module_key),true);
$$;
revoke all on function private.is_company_module_enabled(uuid,text) from public,anon;
grant execute on function private.is_company_module_enabled(uuid,text) to authenticated;

drop policy message_templates_read on public.message_templates;
create policy message_templates_read on public.message_templates for select to authenticated
  using(private.is_company_member(company_id) and private.is_company_module_enabled(company_id,'messages'));
drop policy message_templates_insert on public.message_templates;
create policy message_templates_insert on public.message_templates for insert to authenticated
  with check(private.is_company_member(company_id) and private.is_company_module_enabled(company_id,'messages') and created_by=(select auth.uid()));
drop policy message_templates_update on public.message_templates;
create policy message_templates_update on public.message_templates for update to authenticated
  using(private.is_company_member(company_id) and private.is_company_module_enabled(company_id,'messages'))
  with check(private.is_company_member(company_id) and private.is_company_module_enabled(company_id,'messages'));
drop policy message_templates_delete on public.message_templates;
create policy message_templates_delete on public.message_templates for delete to authenticated
  using(private.is_company_member(company_id) and private.is_company_module_enabled(company_id,'messages'));
