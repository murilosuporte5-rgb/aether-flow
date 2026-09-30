begin;
select set_config('request.jwt.claims',jsonb_build_object('sub',m.user_id::text,'role','authenticated')::text,true)
from public.memberships m join public.companies c on c.id=m.company_id
where not c.is_demo and m.role='owner' order by c.created_at limit 1;
set local role authenticated;
do $$
declare c uuid; s uuid; v integer; stages jsonb; r jsonb; o uuid; a uuid; wait_start timestamptz;
begin
 select m.company_id into c from public.memberships m join public.companies co on co.id=m.company_id
 where m.user_id=auth.uid() and not co.is_demo and m.role='owner' order by co.created_at limit 1;
 if c is null then raise exception 'FAIL no authorized owner fixture'; end if;
 select id into s from public.pipeline_stages where company_id=c and kind='open' order by position limit 1;
 r:=public.apply_workspace_command(c,gen_random_uuid(),jsonb_build_object('kind','create','contactName','QA daily rollback only','phone','+12025550140','title','QA daily transactional proof','stageId',s));
 if r->>'ok'<>'true' then raise exception 'FAIL create %',r; end if; o:=(r->>'id')::uuid;
 r:=public.apply_workspace_command(c,gen_random_uuid(),jsonb_build_object('kind','schedule','id',o,'actionType','Aguardar cliente','dueAt',now()+interval '2 days'));
 select id into a from public.activities where company_id=c and opportunity_id=o and status='pending';
 select waiting_started_at into wait_start from public.opportunities where company_id=c and id=o;
 if wait_start is null then raise exception 'FAIL waiting metadata'; end if;
 r:=public.apply_workspace_command(c,gen_random_uuid(),jsonb_build_object('kind','reschedule','id',o,'actionType','Aguardar cliente','dueAt',now()+interval '3 days'));
 if (select waiting_started_at from public.opportunities where company_id=c and id=o) is distinct from wait_start then raise exception 'FAIL waiting start reset'; end if;
 select id into a from public.activities where company_id=c and opportunity_id=o and status='pending';
 r:=public.apply_workspace_command(c,gen_random_uuid(),jsonb_build_object('kind','complete','id',o,'activityId',a,'result','QA rollback proof','nextStep',jsonb_build_object('type','Follow-up','dueAt',now()+interval '4 days')));
 if (select count(*) from public.activities where company_id=c and opportunity_id=o and status='pending')<>1 then raise exception 'FAIL next action'; end if;
 select pipeline_version into v from public.companies where id=c;
 select jsonb_agg(jsonb_build_object('id',id,'name',name,'kind',kind) order by position) into stages from public.pipeline_stages where company_id=c;
 r:=public.configure_pipeline(c,gen_random_uuid(),jsonb_build_object('kind','pipeline_configure','expectedVersion',v,'stages',stages));
 if (r->>'pipelineVersion')::integer<>v+1 then raise exception 'FAIL pipeline version'; end if;
 r:=public.ensure_owned_workspace('QA no rename','generic','[{"name":"Novo","kind":"open"},{"name":"Ganho","kind":"won"},{"name":"Perdido","kind":"lost"}]');
 if (r->>'companyId')::uuid<>c then raise exception 'FAIL onboarding replay'; end if;
 r:=public.submit_product_feedback(c,gen_random_uuid(),'qa_rollback','QA daily proof; transaction rolled back');
 if r->>'ok'<>'true' then raise exception 'FAIL feedback'; end if;
end $$;
select jsonb_build_object('status','PASS','environment','PRODUCTION_DATABASE_AUTHENTICATED_ROLE_ROLLBACK','checks',array['create','waiting_with_review','waiting_start_preserved','complete_next_action_atomic','pipeline_rpc_under_readonly_grants','existing_onboarding_idempotent','feedback'],'persistent_writes',false) daily_runtime;
rollback;