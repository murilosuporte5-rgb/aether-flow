# Checkpoint — company module and CRM database tests

Branch: `codex/saas-core-2026-10-09`; no production changes.

## Implemented

- `company_modules` stores optional module settings per company. First fully integrated module: saved message templates.
- Owners/admins change it on `/configuracoes`; members can view the setting. The workspace menu and message composer respect it. `/mensagens` requires authentication and a matching company; its client now shows only records loaded from the database.
- The message API rejects requests when the module is off. Message-template RLS also blocks direct reads and writes while disabled. Existing templates remain in the database and reappear when an admin enables the module.
- `scripts/verify-local-postgres.sh` creates a new disposable database without deleting previous databases, applies all migrations and runs nine SQL checks.

## Evidence

- Rebuilt an empty local PostgreSQL database with **46 migrations**, then passed nine SQL checks. These covered company color and module RLS, roles, cross-company reads/writes, CRM creation, pipeline movement and history, CSV import, deduplication, and mutation boundaries. Kanban movement in the browser still needs an authenticated check.
- A separate connection read company A color `#216d51`, company B color `#684c95`, and A's disabled module setting. After an admin enabled the module, a new member connection read the previously saved template.
- `npm run check`, 34 Node tests, and `npm run build` passed. Local HTTP returned a login redirect for `/mensagens` and 401 for unauthenticated module updates.
- Playwright opened the protected messages URL at mobile width and captured the login screen at `/tmp/aether-messages-mobile.png`. An authenticated browser session still needs a local Supabase Auth/PostgREST stack or a separate development project; PostgreSQL alone cannot supply browser login.
