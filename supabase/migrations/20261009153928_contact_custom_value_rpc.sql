create function public.set_contact_custom_field(
  p_company_id uuid,p_contact_id uuid,p_field_key text,p_value jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved jsonb;
begin
  if (select auth.uid()) is null or not private.is_company_member(p_company_id) then
    raise exception using errcode='42501',message='Empresa não autorizada.';
  end if;
  if not exists(select 1 from public.contact_field_definitions
    where company_id=p_company_id and field_key=p_field_key and active) then
    raise exception 'Campo personalizado não disponível.';
  end if;
  update public.contacts set custom_data=case
    when p_value is null then custom_data - p_field_key
    else jsonb_set(custom_data,array[p_field_key],p_value,true)
  end where company_id=p_company_id and id=p_contact_id
  returning custom_data into saved;
  if not found then raise exception 'Contato não encontrado nesta empresa.'; end if;
  return saved;
end $$;
revoke all on function public.set_contact_custom_field(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.set_contact_custom_field(uuid,uuid,text,jsonb) to authenticated;
