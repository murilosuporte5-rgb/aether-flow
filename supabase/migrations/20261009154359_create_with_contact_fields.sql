-- Keep opportunity creation and its contact fields in one transaction.
create function public.create_opportunity_with_contact_fields(
  p_company_id uuid,p_request_id uuid,p_command jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; contact_id uuid; item record; fields jsonb;
begin
  if p_command->>'kind'<>'create' or jsonb_typeof(p_command->'customData')<>'object' then
    raise exception 'Comando de criação ou campos personalizados inválidos.';
  end if;
  fields:=p_command->'customData';
  if (select count(*) from jsonb_object_keys(fields))>20 then raise exception 'Limite de 20 campos personalizados.'; end if;
  result:=public.apply_workspace_command(p_company_id,p_request_id,p_command);
  if (result->>'ok')::boolean is distinct from true then return result; end if;
  select o.contact_id into contact_id from public.opportunities o
    where o.company_id=p_company_id and o.id=(result->>'id')::uuid;
  if contact_id is null then raise exception 'Contato da oportunidade não encontrado.'; end if;
  for item in select key,value from jsonb_each(fields) loop
    perform public.set_contact_custom_field(p_company_id,contact_id,item.key,item.value);
  end loop;
  return result;
end $$;
revoke all on function public.create_opportunity_with_contact_fields(uuid,uuid,jsonb) from public,anon;
grant execute on function public.create_opportunity_with_contact_fields(uuid,uuid,jsonb) to authenticated;
