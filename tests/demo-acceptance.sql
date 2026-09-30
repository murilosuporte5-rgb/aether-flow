begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles order by created_at,id limit 1),true);
select set_config('qa.demo_template',(select t from unnest(array['generic','events','real_estate','hvac','marble','construction','furniture','dental','aesthetics','pools','equipment_rental','glass_aluminum']) t where not exists(select 1 from public.companies c where c.is_demo and c.demo_owner_id=(select auth.uid()) and c.company_template=t) limit 1),true);
set local role authenticated;
do $$
declare c uuid; again uuid; stages jsonb:='[{"name":"Novo","position":0,"kind":"open"},{"name":"Ganho","position":1,"kind":"won"},{"name":"Perdido","position":2,"kind":"lost"}]';samples jsonb;denied boolean;
begin
 if coalesce(current_setting('qa.demo_template'),'')='' then raise exception 'No disposable demo template available';end if;
 samples:=jsonb_build_array(jsonb_build_object('name','QA fictício','title','QA demo','stagePosition',0,'value',100,'dueAt',now()+interval '1 day','lastInteractionAt',now()-interval '7 days'));
 c:=public.ensure_demo_workspace(current_setting('qa.demo_template'),stages,samples);
 again:=public.ensure_demo_workspace(current_setting('qa.demo_template'),stages,samples);
 if c<>again or (select count(*) from public.opportunities where company_id=c)<>1 or (select count(*) from public.contacts where company_id=c)<>1 or (select count(*) from public.activities where company_id=c)<>1 then raise exception 'FAIL idempotent atomic demo';end if;
 if not exists(select 1 from public.opportunity_history where company_id=c and event='created' and payload->>'demo'='true') then raise exception 'FAIL demo history';end if;
 if exists(select 1 from public.contacts where company_id=c and phone is not null) then raise exception 'FAIL fake WhatsApp phone';end if;
 denied:=false;begin perform public.ensure_demo_workspace('unapproved_template',stages,samples);exception when raise_exception then denied:=true;end;
 if not denied then raise exception 'FAIL invalid demo input';end if;
end $$;
reset role;
select jsonb_build_object('status','PASS','checks',array['atomic_demo','demo_idempotency','demo_history','no_fabricated_phone','template_validation'],'fixtures','ROLLED_BACK') as demo_acceptance;
rollback;
