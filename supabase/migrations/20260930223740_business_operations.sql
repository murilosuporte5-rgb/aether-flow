-- Existing customers retain active access; trial applies explicitly to new setups.
alter table public.companies add column subscription_status text not null default 'active'
 check(subscription_status in ('trial','active','expired','suspended'));
alter table public.companies add column trial_started_at timestamptz;
alter table public.companies add column trial_ends_at timestamptz;
alter table public.companies add constraint trial_dates_valid check(
 subscription_status<>'trial' or (trial_started_at is not null and trial_ends_at>trial_started_at));
alter table public.opportunities add column closed_at timestamptz;
-- Preserve unknown history as unknown. Never derive closure from unrelated edits.
update public.opportunities o set closed_at=h.created_at from (
 select distinct on(company_id,opportunity_id) company_id,opportunity_id,created_at
 from public.opportunity_history where event in ('won','lost')
 order by company_id,opportunity_id,created_at desc,id desc
) h where o.company_id=h.company_id and o.id=h.opportunity_id and o.status in ('won','lost');

create function private.company_can_read(c uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.companies where id=c and subscription_status<>'suspended');
$$;
revoke all on function private.company_can_read(uuid) from public,anon;
grant execute on function private.company_can_read(uuid) to authenticated;
create or replace function private.is_company_member(p_company_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select (select auth.uid()) is not null and private.company_can_read(p_company_id)
 and exists(select 1 from public.memberships where company_id=p_company_id and user_id=(select auth.uid()));
$$;
-- Restrictive company policy also closes legacy owner/demo read alternatives.
create policy company_access_read on public.companies as restrictive for select to authenticated
 using(private.company_can_read(id));

create function private.guard_company_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare c public.companies%rowtype;
begin
 if (select auth.uid()) is null then return new; end if;
 select * into c from public.companies where id=new.company_id for share;
 if c.subscription_status in ('suspended','expired') or
 (c.subscription_status='trial' and c.trial_ends_at<=statement_timestamp()) then
  raise exception using errcode='42501',message='Acesso de escrita indisponível. Seus dados foram preservados.';
 end if;
 return new;
end $$;
revoke all on function private.guard_company_write() from public,anon,authenticated;
create trigger company_write_guard before insert or update on public.contacts for each row execute function private.guard_company_write();
create trigger company_write_guard before insert or update on public.opportunities for each row execute function private.guard_company_write();
create trigger company_write_guard before insert or update on public.activities for each row execute function private.guard_company_write();
create trigger company_write_guard before insert or update on public.pipeline_stages for each row execute function private.guard_company_write();
create trigger company_write_guard before insert on public.opportunity_history for each row execute function private.guard_company_write();
create trigger company_write_guard before insert on public.workspace_commands for each row execute function private.guard_company_write();
create trigger company_write_guard before insert on public.product_feedback for each row execute function private.guard_company_write();

create function private.stamp_closure() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='open' then new.closed_at:=null;
 elsif tg_op='INSERT' then new.closed_at:=statement_timestamp();
 elsif new.status is distinct from old.status then new.closed_at:=statement_timestamp();
 else new.closed_at:=old.closed_at; end if;
 return new;
end $$;
revoke all on function private.stamp_closure() from public,anon,authenticated;
create trigger stamp_closure before insert or update on public.opportunities for each row execute function private.stamp_closure();

create table public.admin_operations(
 id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id),
 event text not null check(event in ('account_created','password_reset','account_suspended','account_reactivated','trial_extended','company_updated','support_access','recovery_required')),
 company_id uuid references public.companies(id) on delete set null,
 target_user_id uuid, status text not null check(status in ('pending','success','failed','recovery_required')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 metadata jsonb not null default '{}'::jsonb check(length(metadata::text)<2000)
);
alter table public.admin_operations enable row level security;
revoke all on public.admin_operations from anon,authenticated;
grant select on public.admin_operations to authenticated;
create policy admin_operations_read on public.admin_operations for select to authenticated using(private.is_aether_admin());
create index admin_operations_actor_created on public.admin_operations(actor_id,created_at desc);

-- Reserve an auditable operation before external Auth side effects. Service role
-- can finalize status, but caller-controlled JWT metadata never grants admin.
create function public.begin_admin_operation(p_event text,p_company_id uuid default null,p_target_user_id uuid default null)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); operation uuid;
begin
 if actor is null or not private.is_aether_admin() then raise exception using errcode='42501',message='Administrador requerido.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||'admin_operations',0));
 if (select count(*) from public.admin_operations where actor_id=actor and created_at>now()-interval '10 minutes')>=20 then raise exception 'Limite de operações. Aguarde dez minutos.'; end if;
 insert into public.admin_operations(actor_id,event,company_id,target_user_id,status)
 values(actor,p_event,p_company_id,p_target_user_id,'pending') returning id into operation;
 return operation;
end $$;
revoke all on function public.begin_admin_operation(text,uuid,uuid) from public,anon;
grant execute on function public.begin_admin_operation(text,uuid,uuid) to authenticated;

create function public.admin_customer_catalog() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.is_aether_admin() then raise exception using errcode='42501',message='Administrador requerido.'; end if;
 return jsonb_build_object('customers',coalesce((select jsonb_agg(row_to_json(x)) from (
 select c.id,c.name,c.created_at,c.subscription_status,c.trial_started_at,c.trial_ends_at,
 c.owner_user_id,u.email,u.last_sign_in_at,p.display_name,
 (select count(*) from public.opportunities where company_id=c.id and status='open') open_opportunities,
 (select max(created_at) from public.opportunity_history where company_id=c.id) last_activity,
 (select count(*) from public.opportunities where company_id=c.id and created_at>=now()-interval '7 days') created_7d,
 (select count(*) from public.activities where company_id=c.id and status='done' and completed_at>=now()-interval '7 days') completed_7d,
 (select count(distinct (created_at at time zone 'America/Bahia')::date) from public.opportunity_history
 where company_id=c.id and created_at>=now()-interval '7 days' and event in ('created','activity_completed')) active_days_7d
 from public.companies c left join auth.users u on u.id=c.owner_user_id
 left join public.profiles p on p.id=c.owner_user_id where not c.is_demo order by c.created_at desc limit 500
 ) x),'[]'::jsonb),'feedback',coalesce((select jsonb_agg(row_to_json(x)) from (
 select f.id,f.company_id,c.name company_name,f.user_id,f.context,f.message,f.state,f.created_at
 from public.product_feedback f join public.companies c on c.id=f.company_id order by f.created_at desc limit 200
 ) x),'[]'::jsonb));
end $$;
revoke all on function public.admin_customer_catalog() from public,anon;
grant execute on function public.admin_customer_catalog() to authenticated;

create function public.admin_update_company(p_company_id uuid,p_action text,p_value text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare operation uuid; event_name text; c public.companies%rowtype;
begin
 if not private.is_aether_admin() then raise exception using errcode='42501',message='Administrador requerido.'; end if;
 select * into c from public.companies where id=p_company_id and not is_demo for update;
 if not found then raise exception 'Empresa não encontrada.'; end if;
 event_name:=case p_action when 'suspend' then 'account_suspended' when 'activate' then 'account_reactivated'
 when 'extend_trial' then 'trial_extended' when 'rename' then 'company_updated' else null end;
 if event_name is null then raise exception 'Ação inválida.'; end if;
 operation:=public.begin_admin_operation(event_name,p_company_id,c.owner_user_id);
 if p_action='suspend' then update public.companies set subscription_status='suspended' where id=c.id;
 elsif p_action='activate' then update public.companies set subscription_status='active' where id=c.id;
 elsif p_action='extend_trial' then
  if p_value !~ '^([1-9]|[1-8][0-9]|90)$' then raise exception 'Escolha entre 1 e 90 dias.'; end if;
  update public.companies set subscription_status='trial',trial_started_at=coalesce(trial_started_at,now()),
   trial_ends_at=greatest(coalesce(trial_ends_at,now()),now())+p_value::integer*interval '1 day' where id=c.id;
 else
  if length(btrim(p_value)) not between 2 and 120 then raise exception 'Nome inválido.'; end if;
  update public.companies set name=btrim(p_value) where id=c.id;
 end if;
 update public.admin_operations set status='success',updated_at=now(),metadata=jsonb_build_object('action',p_action) where id=operation;
 return jsonb_build_object('ok',true,'operationId',operation);
end $$;
revoke all on function public.admin_update_company(uuid,text,text) from public,anon;
grant execute on function public.admin_update_company(uuid,text,text) to authenticated;

create function public.admin_review_feedback(p_id uuid,p_state text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not private.is_aether_admin() then raise exception using errcode='42501',message='Administrador requerido.'; end if;
 if p_state not in ('open','reviewed','resolved') or p_state is null then raise exception 'Estado inválido.'; end if;
 update public.product_feedback set state=p_state where id=p_id;
 if not found then raise exception 'Feedback não encontrado.'; end if;
end $$;
revoke all on function public.admin_review_feedback(uuid,text) from public,anon;
grant execute on function public.admin_review_feedback(uuid,text) to authenticated;

create table public.csv_imports(
 company_id uuid not null references public.companies(id), actor_id uuid not null references auth.users(id),
 request_id uuid not null, payload jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
 primary key(company_id,actor_id,request_id)
);
alter table public.csv_imports enable row level security;
revoke all on public.csv_imports from public,anon,authenticated;
grant select on public.csv_imports to authenticated;
create policy imports_read on public.csv_imports for select to authenticated
 using(actor_id=(select auth.uid()) and private.is_company_member(company_id));
create trigger company_write_guard before insert on public.csv_imports for each row execute function private.guard_company_write();
create index csv_imports_actor_created on public.csv_imports(actor_id,created_at desc);

create function public.import_opportunities(p_company_id uuid,p_request_id uuid,p_rows jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); previous public.csv_imports%rowtype; item jsonb; command jsonb;
 result jsonb; contact uuid; normalized text; imported integer:=0; reused integer:=0; stage public.pipeline_stages%rowtype;
begin
 if actor is null or not private.is_company_member(p_company_id) then raise exception using errcode='42501',message='Empresa não autorizada.'; end if;
 if p_request_id is null or jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) not between 1 and 500 or length(p_rows::text)>1000000 then raise exception 'Lote inválido (1 a 500 linhas).'; end if;
 -- Serializing per company prevents parallel imports racing contact deduplication.
 perform pg_advisory_xact_lock(hashtextextended(p_company_id::text||'csv_import',0));
 select * into previous from public.csv_imports where company_id=p_company_id and actor_id=actor and request_id=p_request_id;
 if found then
  if previous.payload<>p_rows then raise exception 'Identificador já utilizado com outro arquivo.'; end if;
  return previous.result||jsonb_build_object('retry',true);
 end if;
 if (select count(*) from public.csv_imports where actor_id=actor and created_at>now()-interval '10 minutes')>=5 then raise exception 'Limite de importações. Aguarde dez minutos.'; end if;
 for item in select value from jsonb_array_elements(p_rows) loop
  normalized:=public.normalize_contact_phone(item->>'phone');
  if normalized is null then raise exception 'Linha %: telefone inválido.',imported+1; end if;
  select * into stage from public.pipeline_stages where company_id=p_company_id and id=(item->>'stageId')::uuid and kind='open';
  if not found then raise exception 'Linha %: escolha uma etapa aberta desta empresa.',imported+1; end if;
  select id into contact from public.contacts where company_id=p_company_id and phone_normalized=normalized;
  command:=item||jsonb_build_object('kind','create','ownerId',actor,'reuseContactId',contact);
  if contact is not null then reused:=reused+1; end if;
  perform public.apply_workspace_command(p_company_id,gen_random_uuid(),command);
  imported:=imported+1;
 end loop;
 result:=jsonb_build_object('ok',true,'imported',imported,'contactsReused',reused,'updated',0,'ignored',0,'errors',0,'retry',false);
 insert into public.csv_imports(company_id,actor_id,request_id,payload,result) values(p_company_id,actor,p_request_id,p_rows,result);
 return result;
end $$;
revoke all on function public.import_opportunities(uuid,uuid,jsonb) from public,anon;
grant execute on function public.import_opportunities(uuid,uuid,jsonb) to authenticated;

-- Auth is external; company, membership, stages and audit finalize atomically.
create function public.provision_customer_workspace(p_operation_id uuid,p_user_id uuid,p_name text,p_template text,p_stages jsonb)
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
 values(btrim(p_name),p_template,p_user_id,'trial',now(),now()+interval '14 days') returning id into company;
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
