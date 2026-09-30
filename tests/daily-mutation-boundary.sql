begin;
do $$ declare p text; begin
 if not has_table_privilege('authenticated','public.pipeline_stages','SELECT') then raise exception 'FAIL pipeline read'; end if;
 foreach p in array array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
  if has_table_privilege('authenticated','public.pipeline_stages',p) or has_table_privilege('anon','public.pipeline_stages',p) then raise exception 'FAIL direct pipeline %',p; end if;
 end loop;
 if has_table_privilege('anon','public.pipeline_stages','SELECT') then raise exception 'FAIL anonymous pipeline read'; end if;
 if has_function_privilege('anon','public.configure_pipeline(uuid,uuid,jsonb)','EXECUTE') or has_function_privilege('anon','public.ensure_owned_workspace(text,text,jsonb)','EXECUTE') or has_function_privilege('anon','public.submit_product_feedback(uuid,uuid,text,text)','EXECUTE') then raise exception 'FAIL anonymous daily RPC'; end if;
end $$;
select jsonb_build_object('status','PASS','checks',array['pipeline_acl','anonymous_daily_rpc_denied'],'persistent_writes',false) daily_boundary;
rollback;
