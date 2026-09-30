-- Deploy guarded transactional runtime before this migration.
-- Operational mutations must cross the authenticated tenant-scoped RPC.
revoke all on public.contacts,public.opportunities,public.activities,public.opportunity_history from authenticated,anon;
grant select on public.contacts,public.opportunities,public.activities,public.opportunity_history to authenticated;
