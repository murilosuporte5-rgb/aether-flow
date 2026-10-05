create or replace function public.review_whatsapp_capture(
  p_capture_id uuid,
  p_request_id uuid,
  p_decision text
) returns jsonb
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  capture_row public.whatsapp_captures%rowtype;
  open_stage uuid;
  existing_contact uuid;
  result jsonb;
begin
  if auth.uid() is null then raise exception 'Sessão necessária.' using errcode = '42501'; end if;
  if p_decision not in ('lead', 'not_lead') then raise exception 'Decisão inválida.'; end if;
  select * into capture_row
    from public.whatsapp_captures
   where id = p_capture_id
     and status = 'pending'
     and private.is_company_member(company_id)
   for update;
  if not found then return jsonb_build_object('ok', false, 'code', 'CAPTURE_NOT_PENDING'); end if;
  if p_decision = 'not_lead' then
    update public.whatsapp_captures
       set status = 'not_lead', reviewed_at = now(), reviewed_by = auth.uid()
     where id = capture_row.id;
    return jsonb_build_object('ok', true, 'status', 'not_lead');
  end if;
  select id into open_stage
    from public.pipeline_stages
   where company_id = capture_row.company_id and kind = 'open'
   order by position limit 1;
  if open_stage is null then raise exception 'A empresa ainda não tem uma etapa aberta.'; end if;
  select id into existing_contact
    from public.contacts
   where company_id = capture_row.company_id and phone = capture_row.phone
   limit 1;
  result := public.apply_workspace_command(
    capture_row.company_id,
    p_request_id,
    jsonb_build_object(
      'kind', 'create',
      'contactName', capture_row.name,
      'phone', capture_row.phone,
      'title', 'WhatsApp · ' || capture_row.name,
      'source', 'WhatsApp automático',
      'stageId', open_stage,
      'details', 'Lead capturado automaticamente pelo WhatsApp. ' || coalesce(capture_row.conversation, 'Sem trecho de conversa disponível.')
    ) || case when existing_contact is null then '{}'::jsonb else jsonb_build_object('reuseContactId', existing_contact) end
  );
  if coalesce((result->>'ok')::boolean, false) is not true then return result; end if;
  update public.whatsapp_captures
     set status = 'lead', opportunity_id = nullif(result->>'id', '')::uuid, reviewed_at = now(), reviewed_by = auth.uid()
   where id = capture_row.id;
  return jsonb_build_object('ok', true, 'status', 'lead', 'opportunityId', result->>'id');
end;
$$;

revoke execute on function public.review_whatsapp_capture(uuid, uuid, text) from public;
grant execute on function public.review_whatsapp_capture(uuid, uuid, text) to authenticated;
