-- Keep the administrator-provisioned customer trial aligned with the public offer.
create or replace function public.provision_customer_workspace(p_operation_id uuid,p_user_id uuid,p_name text,p_template text,p_stages jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare operation public.admin_operations%rowtype; company uuid; stage jsonb; position integer:=0;
begin
 select * into operation from public.admin_operations where id=p_operation_id for update;
 if not found or operation.event<>'account_created' or operation.status<>'pending'
  or not exists(select 1 from public.aether_admins where user_id=operation.actor_id) then raise exception 'Operação inválida.'; end if;
 if length(btrim(p_name)) not between 2 and 120 or jsonb_typeof(p_stages) is distinct from 'array'
  or jsonb_array_length(p_stages) not between 3 and 30 or length(p_stages::text)>10000 then raise exception 'Configuração inválida.'; end if;
 if (select count(*) from jsonb_array_elements(p_stages) x where x->>'kind'='won')<>1
 or (select count(*) from jsonb_array_elements(p_stages) x where x->>'kind'='lost')<>1
 or not exists(select 1 from jsonb_array_elements(p_stages) x where x->>'kind'='open') then raise exception 'Etapas inválidas.'; end if;
 insert into public.companies(name,company_template,owner_user_id,subscription_status,trial_started_at,trial_ends_at)
 values(btrim(p_name),p_template,p_user_id,'trial',now(),now()+interval '7 days') returning id into company;
 insert into public.memberships(company_id,user_id,role) values(company,p_user_id,'owner');
 for stage in select value from jsonb_array_elements(p_stages) loop
  if length(btrim(stage->>'name')) not between 1 and 100 then raise exception 'Nome de etapa inválido.'; end if;
  insert into public.pipeline_stages(company_id,name,kind,position) values(company,btrim(stage->>'name'),stage->>'kind',position);
  position:=position+1;
 end loop;
 update public.admin_operations set company_id=company,target_user_id=p_user_id,status='success',updated_at=now() where id=p_operation_id;
 return jsonb_build_object('companyId',company);
end $$;
revoke all on function public.provision_customer_workspace(uuid,uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.provision_customer_workspace(uuid,uuid,text,text,jsonb) to service_role;
