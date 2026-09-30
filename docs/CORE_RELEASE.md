# Aether Flow — Core execution release

Scope: Prompt 1. Prompts 2–4 remain gated until this layer passes authenticated runtime, mobile and production checks. No commercial outreach or WhatsApp message is sent by this implementation.

## Baseline

- Repository: murilosuporte5-rgb/aether-flow.
- Baseline main: f08f9157fc0786afd2b0d20529f1e260d87f38a5.
- Railway project: 0d6c6fca-ca81-4da4-a5af-ee91f0dfd3ee.
- Production environment: 22f8e56e-2391-4480-9a6f-3d1f93f11f70.
- Service: 160fec62-b04d-466b-9c52-4a3f0b40cd82.
- Successful baseline deployment: d315ed30-94d2-4598-acee-f265e93adc6e.
- Supabase: xffwvvcmeqzimnuqqtus.
- Exact initial data: 2 companies, 3 profiles, 0 contacts/opportunities/activities/history.

## Changes

- One guarded PostgreSQL RPC executes creation/edit/schedule/reschedule/complete/stage/comment/WhatsApp events transactionally.
- Completion requires a dated next step or won/lost outcome. Loss requires a controlled reason; Other requires explanation.
- Normalized phone generated column and unique company/phone index. Explicit existing-contact reuse allows multiple opportunities.
- Command receipts and transaction advisory locks make retries idempotent; a request ID cannot be reused with a different payload.
- Quick form, optional secondary details, initial action, controlled closure modal, readable phone, mobile fixed create action and keyboard focus handling.
- WhatsApp is opened through wa.me after recording whatsapp_opened. Opening does not assert a sent message or reset last_interaction_at.
- Contact time changes only when completion explicitly records a confirmed contact and its result.
- Stale thresholds: normal <3 days, attention 3–6, stale >=7. Missing timestamp remains unknown.
- Priority: overdue timestamp, today, missing next step, stale, waiting action, future, closed.
- Demo seeding is atomic/idempotent and uses no fabricated WhatsApp phone numbers.
- Public /api/health for runtime liveness only; it does not claim a database health check.

## Evidence collected

- npm test: 8 domain acceptance tests PASS.
- npm run check: PASS.
- npm run build: PASS.
- tests/core-acceptance.sql: 23 PostgreSQL checks PASS, all fixtures rolled back.
- tests/demo-acceptance.sql: 5 PostgreSQL checks PASS, all fixtures rolled back.
- Local production-mode /api/health and /login: HTTP 200.
- Repeated requests returned one contact/opportunity, and repeated identical IDs returned the same result. MCP SQL calls were serialized (timestamps did not overlap): these are NOT evidence of true simultaneous HTTP/session concurrency. Required simultaneous test remains pending.
- Disposable concurrency fixture was removed; original counts restored (2 companies; no operational rows).

## Release sequence

1. Verify current main has not advanced; rebase/retest if it has.
2. Confirm rollback of the recorded SUCCESS image remains available in Railway. Baseline restore 63e8783f-5832-4cb3-a5f1-1562dc7907d0 reached SUCCESS in this run.
3. Apply additive migrations, sync their actual versions with migration files.
4. Push the feature branch, switch ONLY this service's source branch temporarily, deploy it.
5. Validate /api/health, login, authenticated core flow and mobile.
6. Apply mutation-boundary permission migration only after the new runtime and atomic demo RPC work. Re-run SQL security tests.
7. Run concurrent authenticated requests in two independent sessions; verify one contact and idempotent opportunities.
8. Merge only after all required gates; return the source branch to main; confirm final SUCCESS and matching commit.

## Rollback

The additive columns, receipt table and RPCs can remain when rolling back application code; no existing data must be dropped. Do not attempt a destructive down migration.

If mutation-boundary grants were tightened, restore legacy INSERT/UPDATE grants on contacts, opportunities and activities, and INSERT on opportunity_history via a tracked rollback migration BEFORE restoring the old image. Preserve SELECT and existing RLS; do not grant DELETE/TRUNCATE or expose service secrets.

Select the recorded successful deployment in Railway's deployment list and use its rollback action, if retained. Check status, /login and application writes with a disposable fixture. Restore GitHub source to main. If that retained image is unavailable, deploy the exact baseline commit from a recovery branch; never guess a successful rollback.

## Existing issues outside Prompt 1

- create-access compensation is unchecked and currently claims no partial access even if compensation fails. Requires Prompt 4 correction and its acceptance tests.
- Supabase leaked-password protection is disabled (security advisor WARN); availability/configuration must be verified before enabling or recording a justified limitation.
- Existing multiple permissive INSERT policies need a semantics-preserving consolidation in hardening.
- Temporary Railway branch deployment dbcd9a0abca7097326e00854348661c7b2a52c19 reached SUCCESS (4d08f1ab-594b-4ff0-8e3e-99fe6906fd32); public health returned HTTP 200.
- Authenticated E2E/mobile and actual simultaneous request test remain NOT_TESTED: the app rejected the secure login attempt with “E-mail ou senha inválidos”. No password was accessed by the agent.
- The permission activation SQL in docs/pending/core_mutation_boundary.sql is NOT_APPLIED; it is intentionally outside the migration directory until deployment gates pass. Legacy direct writes must remain available while the old runtime is restored. Core is not released into main.
- Two new security-advisor WARN findings identify intentionally authenticated SECURITY DEFINER RPCs. They have empty search_path, verified auth.uid(), scoped membership/ownership checks, bounded inputs, revoked anon/PUBLIC execution and composite FKs. Tenant adversarial tests passed; final independent security review remains part of Prompt 4.

## Production restored

After the secure login was rejected, source was returned to main at f08f9157fc0786afd2b0d20529f1e260d87f38a5, healthcheck /login, deployment 63e8783f-5832-4cb3-a5f1-1562dc7907d0 SUCCESS. Later phone-storage/accessibility refinements remain on the feature branch and require another temporary production test. No merge was performed.
