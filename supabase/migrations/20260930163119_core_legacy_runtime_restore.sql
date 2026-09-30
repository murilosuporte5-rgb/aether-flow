-- QA rollback: restore only the permissions required by the current main runtime.
-- Keep DELETE/TRUNCATE/REFERENCES/TRIGGER revoked. RLS remains unchanged.
grant select,insert,update on public.contacts,public.opportunities,public.activities to authenticated;
grant select,insert on public.opportunity_history to authenticated;
