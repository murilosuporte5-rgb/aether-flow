create index if not exists idx_activities_company_owner on public.activities(company_id,owner_id);
create index if not exists idx_memberships_user on public.memberships(user_id);
create index if not exists idx_opportunities_company_contact on public.opportunities(company_id,contact_id);
create index if not exists idx_opportunities_company_owner on public.opportunities(company_id,owner_id);
create index if not exists idx_opportunity_history_actor on public.opportunity_history(actor_id);
