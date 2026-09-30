-- Real PostgreSQL tests: no auth.users writes, fixtures and commands rolled back.
begin;
select set_config('aether_test.actor_a',(select id::text from public.profiles order by created_at,id limit 1),true);
select set_config('aether_test.actor_b',(select id::text from public.profiles order by created_at,id offset 1 limit 1),true);
with c as (insert into public.companies(name,company_template) values('QA core A — transaction only','generic') returning id)
select set_config('aether_test.company_a',id::text,true) from c;
with c as (insert into public.companies(name,company_template) values('QA core B — transaction only','generic') returning id)
select set_config('aether_test.company_b',id::text,true) from c;
insert into public.memberships(company_id,user_id,role) values
(current_setting('aether_test.company_a')::uuid,current_setting('aether_test.actor_a')::uuid,'owner'),
(current_setting('aether_test.company_b')::uuid,current_setting('aether_test.actor_b')::uuid,'owner');
insert into public.pipeline_stages(company_id,name,position,kind)
select c::uuid,s.name,s.position,s.kind from unnest(array[current_setting('aether_test.company_a'),current_setting('aether_test.company_b')]) c
cross join (values('Novo',0,'open'),('Proposta',1,'open'),('Ganho',2,'won'),('Perdido',3,'lost')) s(name,position,kind);
select set_config('request.jwt.claim.sub',current_setting('aether_test.actor_a'),true);
set local role authenticated;
do $$
declare
 ca uuid:=current_setting('aether_test.company_a')::uuid;
 cb uuid:=current_setting('aether_test.company_b')::uuid;
 actor_a uuid:=current_setting('aether_test.actor_a')::uuid;
 stage_a uuid; stage_b uuid; lost_stage uuid; r jsonb; original jsonb; oid uuid; oid2 uuid; cid uuid; aid uuid;
 req uuid:=gen_random_uuid(); cmd jsonb; n integer; hist_count integer; denied boolean;
 old_last timestamptz;
begin
 select id into stage_a from public.pipeline_stages where company_id=ca and kind='open' order by position limit 1;
 select id into lost_stage from public.pipeline_stages where company_id=ca and kind='lost';
 if stage_a is null then raise exception 'Fixture A unavailable under RLS'; end if;
 if exists(select 1 from public.companies where id=cb) or exists(select 1 from public.pipeline_stages where company_id=cb) then raise exception 'FAIL tenant B visible'; end if;
 denied:=false;begin perform public.apply_workspace_command(cb,gen_random_uuid(),jsonb_build_object('kind','create'));exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'FAIL cross-tenant RPC';end if;
 foreach cmd in array array[
  jsonb_build_object('kind','create','contactName','QA','title','Sem telefone','stageId',stage_a),
  jsonb_build_object('kind','create','contactName','QA','title','Telefone inválido','stageId',stage_a,'phone','00000000000')
 ] loop
  denied:=false;begin perform public.apply_workspace_command(ca,gen_random_uuid(),cmd);exception when raise_exception then denied:=true;end;
  if not denied then raise exception 'FAIL invalid/missing phone accepted';end if;
 end loop;
 if (select count(*) from public.contacts where company_id=ca)<>0 then raise exception 'FAIL invalid create wrote contact';end if;
 cmd:=jsonb_build_object('kind','create','contactName','QA João','title','Proposta QA','stageId',stage_a,'phone','(71) 99999-9999','actionType','WhatsApp','dueAt',now()+interval '1 day');
 r:=public.apply_workspace_command(ca,req,cmd);original:=r; oid:=(r->>'id')::uuid;
 if not (r->>'ok')::boolean then raise exception 'FAIL valid create'; end if;
 select contact_id,last_interaction_at into cid,old_last from public.opportunities where id=oid;
 if old_last is not null then raise exception 'FAIL creation invented interaction';end if;
 if (select phone_normalized from public.contacts where id=cid)<>'5571999999999' then raise exception 'FAIL normalization';end if;
 r:=public.apply_workspace_command(ca,req,cmd);
 if r<>original or (select count(*) from public.opportunities where company_id=ca)<>1 then raise exception 'FAIL idempotency';end if;
 denied:=false;begin perform public.apply_workspace_command(ca,req,cmd||jsonb_build_object('title','Changed payload'));exception when raise_exception then denied:=true;end;
 if not denied then raise exception 'FAIL idempotency key reused';end if;
 r:=public.apply_workspace_command(ca,gen_random_uuid(),cmd||jsonb_build_object('phone','+55 71 99999-9999'));
 if r->>'code'<>'DUPLICATE_CONTACT' or r->'contact'->>'id'<>cid::text then raise exception 'FAIL duplicate';end if;
 if (select count(*) from public.contacts where company_id=ca)<>1 or (select count(*) from public.opportunities where company_id=ca)<>1 then raise exception 'FAIL duplicate wrote business data';end if;
 r:=public.apply_workspace_command(ca,gen_random_uuid(),cmd||jsonb_build_object('reuseContactId',cid,'title','Segunda oportunidade'));
 oid2:=(r->>'id')::uuid;
 if (select count(*) from public.contacts where company_id=ca)<>1 or (select count(*) from public.opportunities where company_id=ca)<>2 then raise exception 'FAIL explicit reuse';end if;
 select id into aid from public.activities where company_id=ca and opportunity_id=oid and status='pending';
 select count(*) into hist_count from public.opportunity_history where opportunity_id=oid;
 denied:=false;begin perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid));exception when raise_exception then denied:=true;end;
 if not denied or (select status from public.activities where id=aid)<>'pending' then raise exception 'FAIL completion without next step';end if;
 -- Failure occurs AFTER the old activity is updated, proving rollback of that write.
 denied:=false;begin perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid,'nextStep',jsonb_build_object('type','WhatsApp','dueAt','not-a-date')));exception when invalid_datetime_format then denied:=true;end;
 if not denied or (select status from public.activities where id=aid)<>'pending' or (select count(*) from public.opportunity_history where opportunity_id=oid)<>hist_count then raise exception 'FAIL rollback on next action failure';end if;
 perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid,'contactConfirmed',true,'result','Cliente pediu retorno','nextStep',jsonb_build_object('type','Ligação','dueAt',now()+interval '2 days')));
 if (select status from public.activities where id=aid)<>'done' or (select count(*) from public.activities where opportunity_id=oid and status='pending')<>1 or (select next_action_type from public.opportunities where id=oid)<>'Ligação' then raise exception 'FAIL complete and next';end if;
 select last_interaction_at into old_last from public.opportunities where id=oid;
 if old_last is null then raise exception 'FAIL confirmed contact absent';end if;
 perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','whatsapp_opened','id',oid));
 if (select last_interaction_at from public.opportunities where id=oid) is distinct from old_last then raise exception 'FAIL WhatsApp invented contact';end if;
 if not exists(select 1 from public.opportunity_history where opportunity_id=oid and event='whatsapp_opened' and actor_id=actor_a and payload->>'opportunity_id'=oid::text and payload->>'timestamp' is not null) then raise exception 'FAIL WhatsApp audit';end if;
 select id into aid from public.activities where opportunity_id=oid and status='pending';
 denied:=false;begin perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid,'nextStep',jsonb_build_object('outcome','lost')));exception when raise_exception then denied:=true;end;
 if not denied or (select status from public.activities where id=aid)<>'pending' then raise exception 'FAIL missing loss reason';end if;
 denied:=false;begin perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid,'nextStep',jsonb_build_object('outcome','lost','lossReason','Outro')));exception when raise_exception then denied:=true;end;
 if not denied then raise exception 'FAIL Other loss without note';end if;
 perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid,'activityId',aid,'nextStep',jsonb_build_object('outcome','lost','lossReason','Outro','lossNote','Motivo QA')));
 if (select status from public.opportunities where id=oid)<>'lost' or (select loss_reason from public.opportunities where id=oid)<>'Outro' or exists(select 1 from public.activities where opportunity_id=oid and status='pending') then raise exception 'FAIL complete and lose';end if;
 if not exists(select 1 from public.opportunity_history where opportunity_id=oid and event='loss_reason' and payload->>'note'='Motivo QA' and actor_id=actor_a) then raise exception 'FAIL loss history';end if;
 select id into aid from public.activities where opportunity_id=oid2 and status='pending';
 perform public.apply_workspace_command(ca,gen_random_uuid(),jsonb_build_object('kind','complete','id',oid2,'activityId',aid,'nextStep',jsonb_build_object('outcome','won')));
 if (select status from public.opportunities where id=oid2)<>'won' or (select next_action_at from public.opportunities where id=oid2) is not null then raise exception 'FAIL complete and win';end if;
 select count(*) into hist_count from public.opportunity_history where opportunity_id=oid;
 begin delete from public.opportunity_history where opportunity_id=oid;exception when insufficient_privilege then null;end;
 if (select count(*) from public.opportunity_history where opportunity_id=oid)<>hist_count then raise exception 'FAIL history deleted';end if;
 begin update public.opportunity_history set description='Tampered' where opportunity_id=oid;exception when insufficient_privilege then null;end;
 if exists(select 1 from public.opportunity_history where opportunity_id=oid and description='Tampered') then raise exception 'FAIL history updated';end if;
 perform set_config('aether_test.opportunity_a',oid::text,true);
end $$;
select set_config('request.jwt.claim.sub',current_setting('aether_test.actor_b'),true);
do $$
declare ca uuid:=current_setting('aether_test.company_a')::uuid; cb uuid:=current_setting('aether_test.company_b')::uuid; st uuid; r jsonb; denied boolean;
begin
 if exists(select 1 from public.contacts where company_id=ca) or exists(select 1 from public.opportunities where company_id=ca) or exists(select 1 from public.activities where company_id=ca) or exists(select 1 from public.opportunity_history where company_id=ca) or exists(select 1 from public.workspace_commands where company_id=ca) then raise exception 'FAIL tenant A data visible from B';end if;
 denied:=false;begin perform public.apply_workspace_command(cb,gen_random_uuid(),jsonb_build_object('kind','comment','id',current_setting('aether_test.opportunity_a'),'comment','Cross tenant'));exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'FAIL foreign opportunity mutation';end if;
 select id into st from public.pipeline_stages where company_id=cb and kind='open' order by position limit 1;
 r:=public.apply_workspace_command(cb,gen_random_uuid(),jsonb_build_object('kind','create','contactName','QA B','title','Same number different tenant','stageId',st,'phone','71999999999'));
 if not (r->>'ok')::boolean or (select count(*) from public.contacts where company_id=cb)<>1 then raise exception 'FAIL company-scoped uniqueness';end if;
end $$;
reset role;
select jsonb_build_object('status','PASS','checks',array['invalid_phone','valid_phone','no_phone','duplicate_phone','explicit_reuse','idempotency','idempotency_conflict','complete_without_next_rejected','rollback_next_action_failure','complete_next','complete_lost','complete_won','loss_reason_required','other_note_required','whatsapp_audit','whatsapp_no_fake_interaction','history_append_only','tenant_reads','tenant_rpc','company_scoped_uniqueness'],'fixtures','ROLLED_BACK') as acceptance_result;
rollback;
