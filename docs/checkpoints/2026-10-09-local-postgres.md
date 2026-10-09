# Checkpoint — isolated PostgreSQL validation

Development branch: `codex/saas-core-2026-10-09`. Production database untouched.

- Docker initially had zero registered images, containers, volumes or build cache. It uses the `vfs` driver. `docker system prune -f` reclaimed 0 B; there was no user data to delete.
- The large Supabase Postgres image failed while unpacking. A smaller `postgres:16-alpine` image (294.3 MB) started as `aether-dev-pg`, bound only to `127.0.0.1:55432`. This is a disposable local development database.
- `tests/local-supabase-bootstrap.sql` supplies the minimal Auth schema and `auth.uid()` used by the app migrations. It is a test substitute for Supabase Auth, not a claim that the complete Supabase stack is running.
- All 44 app migrations, including `company_branding`, applied successfully to local PostgreSQL.
- `tests/company-branding-boundary.sql` passed. `tests/company-branding-integration.sql` created companies A and B with owner, member and admin roles. Owner A inserted, admin A updated, member A read but could not update, owner B read only B. Cross-company insert/read was denied.
- Two new PostgreSQL processes read back the committed records separately: A returned `#216d51`, B returned `#684c95`. This verifies persistence across database sessions.

Browser refresh and real Supabase login are still a separate end-to-end gate; the local PostgreSQL test does not simulate those services.
