-- Apply only after the transactional runtime and atomic demo are deployed/tested.
-- Authenticated clients must use guarded RPCs for operational mutations.
revoke all on public.contacts,public.opportunities,public.activities,public.opportunity_history from authenticated,anon;
grant select on public.contacts,public.opportunities,public.activities,public.opportunity_history to authenticated;
