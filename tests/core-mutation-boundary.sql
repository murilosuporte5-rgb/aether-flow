-- Execute after activating RPC-only permissions. No permanent fixture writes.
begin;
do $$
declare t text; r text; p text;
begin
 foreach t in array array['contacts','opportunities','activities','opportunity_history'] loop
  if not has_table_privilege('authenticated','public.'||t,'SELECT') then raise exception 'FAIL authenticated read grant: %',t; end if;
  foreach r in array array['authenticated','anon'] loop
   foreach p in array array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
    if has_table_privilege(r,'public.'||t,p) then raise exception 'FAIL direct % on % for %',p,t,r; end if;
   end loop;
  end loop;
  if has_table_privilege('anon','public.'||t,'SELECT') then raise exception 'FAIL anonymous read: %',t; end if;
 end loop;
 if not has_function_privilege('authenticated','public.apply_workspace_command(uuid,uuid,jsonb)','EXECUTE') then raise exception 'FAIL authenticated RPC missing'; end if;
 if has_function_privilege('anon','public.apply_workspace_command(uuid,uuid,jsonb)','EXECUTE') then raise exception 'FAIL anonymous RPC'; end if;
end $$;
set local role authenticated;
do $$
declare t text; statement text; denied boolean;
begin
 foreach t in array array['contacts','opportunities','activities','opportunity_history'] loop
  foreach statement in array array[
   format('insert into public.%I default values',t),
   format('update public.%I set company_id=company_id where false',t),
   format('delete from public.%I where false',t)
  ] loop
   denied:=false;
   begin execute statement; exception when insufficient_privilege then denied:=true; end;
   if not denied then raise exception 'FAIL authenticated direct statement: %',statement; end if;
  end loop;
 end loop;
end $$;
set local role anon;
do $$
declare t text; denied boolean;
begin
 foreach t in array array['contacts','opportunities','activities','opportunity_history'] loop
  denied:=false;
  begin execute format('select count(*) from public.%I',t); exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'FAIL anonymous statement: %',t; end if;
 end loop;
end $$;
reset role;
select jsonb_build_object('status','PASS','checks',array['rpc_execute_acl','table_acl_matrix','authenticated_direct_insert_update_delete_denied','anonymous_select_denied'],'persistent_writes',false) as boundary_result;
rollback;
