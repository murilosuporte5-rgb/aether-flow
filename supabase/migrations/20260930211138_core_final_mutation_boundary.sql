-- Activate guarded RPC-only operational writes after authenticated acceptance on deployed core runtime.
revoke all on public.contacts,public.opportunities,public.activities,public.opportunity_history from authenticated,anon;
grant select on public.contacts,public.opportunities,public.activities,public.opportunity_history to authenticated;
