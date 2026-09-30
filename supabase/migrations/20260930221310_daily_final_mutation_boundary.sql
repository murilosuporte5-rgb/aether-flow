-- Activation template. Apply as a NEW tracked migration only after transactional
-- onboarding and owner-controlled pipeline runtime pass QA on Railway.
revoke all on public.pipeline_stages from authenticated,anon;
grant select on public.pipeline_stages to authenticated;
