-- Activation template, not an unapplied historical migration.
-- 20260930162312 applied these grants and passed the boundary/core/demo tests.
-- 20260930163119 restored minimal legacy grants before returning Railway to main.
-- Final activation requires a NEW tracked migration after authenticated mobile QA.
-- Apply only while the approved transactional runtime and atomic demo are deployed.
-- Authenticated clients must use guarded RPCs for operational mutations.
revoke all on public.contacts,public.opportunities,public.activities,public.opportunity_history from authenticated,anon;
grant select on public.contacts,public.opportunities,public.activities,public.opportunity_history to authenticated;
