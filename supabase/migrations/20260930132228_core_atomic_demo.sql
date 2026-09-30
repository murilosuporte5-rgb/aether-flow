-- Demo setup is one transaction and safe under repeated/concurrent requests.
create or replace function public.ensure_demo_workspace(p_template text,p_stages jsonb,p_samples jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid:=(select auth.uid()); c uuid; stage_id uuid; contact_id uuid; opportunity_id uuid;
  sample jsonb; entry jsonb; stage_kind text; stage_count integer; due timestamptz; action_type text;
begin
  if actor is null then raise exception using errcode='42501',message='Sessão ausente.'; end if;
  if p_template not in ('generic','events','real_estate','hvac','marble','construction','furniture','dental','aesthetics','pools','equipment_rental','glass_aluminum')
    or jsonb_typeof(p_stages) is distinct from 'array' or jsonb_typeof(p_samples) is distinct from 'array'
    or jsonb_array_length(p_stages) not between 3 and 20 or jsonb_array_length(p_samples)>20
    or length(p_stages::text)>5000 or length(p_samples::text)>20000 then raise exception 'Demonstração inválida.';end if;
  perform pg_advisory_xact_lock(hashtextextended(actor::text||'demo'||p_template,0));
  select id into c from public.companies where is_demo and demo_owner_id=actor and company_template=p_template;
  if c is null then
    insert into public.companies(name,company_template,is_demo,demo_owner_id)
    values('Aether Demo Company',p_template,true,actor) returning id into c;
  end if;
  insert into public.memberships(company_id,user_id,role) values(c,actor,'owner') on conflict do nothing;
  if exists(select 1 from public.opportunities where company_id=c) then return c;end if;
  if not exists(select 1 from public.pipeline_stages where company_id=c) then
    for entry in select value from jsonb_array_elements(p_stages) loop
      insert into public.pipeline_stages(company_id,name,position,kind) values(c,entry->>'name',(entry->>'position')::integer,entry->>'kind');
    end loop;
  end if;
  select count(*) into stage_count from public.pipeline_stages where company_id=c;
  for sample in select value from jsonb_array_elements(p_samples) loop
    select id,kind into stage_id,stage_kind from public.pipeline_stages where company_id=c order by position offset ((sample->>'stagePosition')::integer % stage_count) limit 1;
    if stage_id is null then raise exception 'Estágio inválido.';end if;
    insert into public.contacts(company_id,name,organization) values(c,sample->>'name',sample->>'organization') returning id into contact_id;
    due:=case when stage_kind='open' then nullif(sample->>'dueAt','')::timestamptz end;
    action_type:=case when due is not null then 'Follow-up' end;
    insert into public.opportunities(company_id,contact_id,title,stage_id,owner_id,estimated_value,status,source,details,last_interaction_at,next_action_type,next_action_at)
    values(c,contact_id,sample->>'title',stage_id,actor,(sample->>'value')::numeric,stage_kind,'Demonstração',sample->>'details',nullif(sample->>'lastInteractionAt','')::timestamptz,action_type,due) returning id into opportunity_id;
    perform private.append_opportunity_event(c,opportunity_id,'created','Oportunidade fictícia criada para demonstração',jsonb_build_object('demo',true));
    if due is not null then
      insert into public.activities(company_id,opportunity_id,owner_id,type,due_at,status) values(c,opportunity_id,actor,action_type,due,'pending');
      perform private.append_opportunity_event(c,opportunity_id,'activity_created','Ação fictícia criada',jsonb_build_object('demo',true,'type',action_type,'due_at',due));
    end if;
  end loop;
  return c;
end $$;
revoke all on function public.ensure_demo_workspace(text,jsonb,jsonb) from public,anon;
grant execute on function public.ensure_demo_workspace(text,jsonb,jsonb) to authenticated;
