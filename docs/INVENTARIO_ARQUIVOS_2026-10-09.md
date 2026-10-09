# Inventário de arquivos do Aether Flow

Inventário de 262 caminhos versionados ou preparados nesta branch em 09/10/2026. Este é um índice de localização, não uma afirmação de que todas as funcionalidades estejam concluídas. Para estado e pendências, veja `docs/STATUS_GERAL_2026-10-09.md`.

## .github (1)

- `.github/workflows/core-acceptance.yml`

## app (101)

- `app/activate/form.tsx`
- `app/activate/page.tsx`
- `app/activate/reset-form.tsx`
- `app/adm/ativar/form.tsx`
- `app/adm/ativar/page.tsx`
- `app/adm/page.tsx`
- `app/admin/customers.tsx`
- `app/admin/form.tsx`
- `app/admin/page.tsx`
- `app/aether-logo.tsx`
- `app/ajuda/page.tsx`
- `app/api/admin/claim/route.ts`
- `app/api/admin/invite/route.ts`
- `app/api/company-branding/route.ts`
- `app/api/company-modules/route.ts`
- `app/api/contact-fields/route.ts`
- `app/api/contacts/custom-field/route.ts`
- `app/api/contacts/email/route.ts`
- `app/api/data/route.ts`
- `app/api/email/send/route.ts`
- `app/api/health/route.ts`
- `app/api/message-templates/route.ts`
- `app/api/onboarding/route.ts`
- `app/api/operations/route.ts`
- `app/api/team/route.ts`
- `app/api/webhooks/evolution/route.ts`
- `app/api/webhooks/whatsapp/route.ts`
- `app/api/whatsapp/captures/route.ts`
- `app/api/whatsapp/config/route.ts`
- `app/api/whatsapp/connect/route.ts`
- `app/api/whatsapp/connection/route.ts`
- `app/api/whatsapp/pair/route.ts`
- `app/api/whatsapp/qr/route.ts`
- `app/api/whatsapp/status/route.ts`
- `app/api/workspace/route.ts`
- `app/auth/confirm/route.ts`
- `app/auth/signout/route.ts`
- `app/business-operations.tsx`
- `app/cadastro/form.tsx`
- `app/cadastro/page.tsx`
- `app/capturar/capture-client.tsx`
- `app/capturar/page.tsx`
- `app/capturar/share/route.ts`
- `app/configuracoes/branding-form.tsx`
- `app/configuracoes/contact-fields-form.tsx`
- `app/configuracoes/modules-form.tsx`
- `app/configuracoes/page.tsx`
- `app/contact-custom-fields.tsx`
- `app/contacts.tsx`
- `app/contatos/page.tsx`
- `app/core-form.tsx`
- `app/dashboard.tsx`
- `app/demo-showcase.tsx`
- `app/demo/demo-workspace.css`
- `app/demo/demo-workspace.tsx`
- `app/demo/page.tsx`
- `app/email-action.tsx`
- `app/entrar/page.tsx`
- `app/feature-guide.tsx`
- `app/globals.css`
- `app/integracoes/whatsapp/page.tsx`
- `app/integracoes/whatsapp/whatsapp-connect.tsx`
- `app/landing-commercial-section.tsx`
- `app/landing-cta.ts`
- `app/landing-footer.tsx`
- `app/landing-header.tsx`
- `app/landing-mobile-proof.tsx`
- `app/landing-page.tsx`
- `app/landing-product-gallery.tsx`
- `app/landing/_components/LandingSubpage.tsx`
- `app/landing/como-funciona/page.tsx`
- `app/landing/duvidas/page.tsx`
- `app/landing/page.tsx`
- `app/landing/para-quem/page.tsx`
- `app/landing/preco/page.tsx`
- `app/landing/recursos/page.tsx`
- `app/landing/telas/page.tsx`
- `app/layout.tsx`
- `app/login/form.tsx`
- `app/login/page.tsx`
- `app/manifest.ts`
- `app/mensagens/messages-client.tsx`
- `app/mensagens/page.tsx`
- `app/message-bank.tsx`
- `app/onboarding.tsx`
- `app/operacao/page.tsx`
- `app/operational-timeline.tsx`
- `app/page.tsx`
- `app/performance-metrics.tsx`
- `app/pipeline-settings.tsx`
- `app/privacidade/page.tsx`
- `app/product-feedback.tsx`
- `app/recuperar-senha/form.tsx`
- `app/recuperar-senha/page.tsx`
- `app/stale-indicator.tsx`
- `app/team.tsx`
- `app/termos/page.tsx`
- `app/weekly-summary.tsx`
- `app/whatsapp-action.tsx`
- `app/workspace-page.tsx`
- `app/workspace.tsx`

## docs (25)

- `docs/AETHER_ENGAGEMENT_RESEARCH_2026.md`
- `docs/AETHER_MARKET_UX_RESEARCH_2026.md`
- `docs/CODEX_AETHER_CAPTURE_UX_PROMPT.md`
- `docs/CODEX_AETHER_CHECKPOINT_20261003.md`
- `docs/CORE_RELEASE.md`
- `docs/DAILY_RELEASE.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/INVENTARIO_ARQUIVOS_2026-10-09.md`
- `docs/MASTER_IMPLEMENTATION_HANDOFF_20260930.md`
- `docs/SPRINT_CHECKPOINT.md`
- `docs/STATUS_GERAL_2026-10-09.md`
- `docs/aether_ai_negotiation_knowledge.sql`
- `docs/checkpoints/2026-10-09-configurable-form.md`
- `docs/checkpoints/2026-10-09-contact-fields.md`
- `docs/checkpoints/2026-10-09-local-postgres.md`
- `docs/checkpoints/2026-10-09-modules-crm.md`
- `docs/checkpoints/2026-10-09-saas-core.md`
- `docs/pending/core_mutation_boundary.sql`
- `docs/pending/daily_mutation_boundary.sql`
- `docs/qa/LOCAL_ACCEPTANCE.md`
- `docs/qa/aether-flow-qa-20260930-1601.jpg`
- `docs/qa/core-mobile-20260930/summary.json`
- `docs/qa/daily-20260930/release-gates.json`
- `docs/qa/daily-20260930/summary.json`
- `docs/resend.md`

## extension (4)

- `extension/README.md`
- `extension/background.js`
- `extension/content.js`
- `extension/manifest.json`

## lib (23)

- `lib/auth-recovery.ts`
- `lib/company-branding.ts`
- `lib/company-modules.ts`
- `lib/conflict-alerts.ts`
- `lib/contact-fields.ts`
- `lib/csv.ts`
- `lib/daily-work.ts`
- `lib/execution.ts`
- `lib/import-validation.ts`
- `lib/metrics.ts`
- `lib/note-extraction.ts`
- `lib/opportunity-guidance.ts`
- `lib/provision.ts`
- `lib/rate-limit.ts`
- `lib/request-origin.ts`
- `lib/supabase/admin.ts`
- `lib/supabase/browser.ts`
- `lib/supabase/config.ts`
- `lib/supabase/proxy.ts`
- `lib/supabase/server.ts`
- `lib/templates.ts`
- `lib/whatsapp-rate-limit.ts`
- `lib/whatsapp-webhook.ts`

## public (17)

- `public/brand/aether-mark.png`
- `public/demo/alerts-v2.png`
- `public/demo/contacts-v2.png`
- `public/demo/data-v2.png`
- `public/demo/messages-v2.png`
- `public/demo/mobile-alerts-v3.png`
- `public/demo/mobile-contacts-v3.png`
- `public/demo/mobile-data-v3.png`
- `public/demo/mobile-messages-v3.png`
- `public/demo/mobile-panel-v3.png`
- `public/demo/mobile-pipeline-v3.png`
- `public/demo/mobile-team-v3.png`
- `public/demo/panel-v2.png`
- `public/demo/pipeline-v2.png`
- `public/demo/team-v2.png`
- `public/downloads/aether-flow-capture.zip`
- `public/favicon.svg`

## raiz (9)

- `.env.example`
- `.gitignore`
- `README.md`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `postcss.config.mjs`
- `proxy.ts`
- `tsconfig.json`

## scripts (3)

- `scripts/bootstrap-admin.mjs`
- `scripts/local-qa-env.mjs`
- `scripts/verify-local-postgres.sh`

## supabase (51)

- `supabase/functions/create-access/index.ts`
- `supabase/functions/team-access/index.ts`
- `supabase/migrations/20260929095439_aether_core.sql`
- `supabase/migrations/20260929111121_enable_admin_demo_self_provision.sql`
- `supabase/migrations/20260929111257_allow_admin_read_owned_demo.sql`
- `supabase/migrations/20260929111544_enable_self_service_demo.sql`
- `supabase/migrations/20260929112134_add_foreign_key_indexes.sql`
- `supabase/migrations/20260929112358_simplify_self_service_demo_policies.sql`
- `supabase/migrations/20260929130647_add_initial_admin_bootstrap.sql`
- `supabase/migrations/20260929130824_secure_initial_admin_bootstrap.sql`
- `supabase/migrations/20260929140134_enable_self_service_workspace_onboarding.sql`
- `supabase/migrations/20260929141151_fix_self_service_membership_policy.sql`
- `supabase/migrations/20260930130958_core_execution_engine.sql`
- `supabase/migrations/20260930132228_core_atomic_demo.sql`
- `supabase/migrations/20260930134524_core_international_phone.sql`
- `supabase/migrations/20260930162312_core_mutation_boundary.sql`
- `supabase/migrations/20260930163119_core_legacy_runtime_restore.sql`
- `supabase/migrations/20260930211138_core_final_mutation_boundary.sql`
- `supabase/migrations/20260930220201_daily_work_engine.sql`
- `supabase/migrations/20260930221310_daily_final_mutation_boundary.sql`
- `supabase/migrations/20260930223740_business_operations.sql`
- `supabase/migrations/20261001093000_message_templates.sql`
- `supabase/migrations/20261001122226_team_management.sql`
- `supabase/migrations/20261001143000_fix_team_add_member_owner_role.sql`
- `supabase/migrations/20261001162155_contact_email.sql`
- `supabase/migrations/20261003170552_operations_inventory.sql`
- `supabase/migrations/20261003170609_operation_lots_and_alerts.sql`
- `supabase/migrations/20261003170613_operation_requests_and_damage.sql`
- `supabase/migrations/20261003170617_product_commercial_availability.sql`
- `supabase/migrations/20261003170620_opportunity_commercial_availability.sql`
- `supabase/migrations/20261003170624_opportunity_owner_reassignment.sql`
- `supabase/migrations/20261003170630_opportunity_metadata.sql`
- `supabase/migrations/20261003170634_allow_company_admin_operations.sql`
- `supabase/migrations/20261003170638_opportunity_competitor.sql`
- `supabase/migrations/20261003170642_negotiation_context.sql`
- `supabase/migrations/20261003170649_optimistic_opportunity_edit.sql`
- `supabase/migrations/20261003170653_allow_company_admin_pipeline.sql`
- `supabase/migrations/20261003170657_terms_acceptance.sql`
- `supabase/migrations/20261003170701_safe_stage_undo.sql`
- `supabase/migrations/20261003171254_advisor_fk_indexes.sql`
- `supabase/migrations/20261004170000_whatsapp_evolution_connections.sql`
- `supabase/migrations/20261005120000_align_trial_to_seven_days.sql`
- `supabase/migrations/20261005143000_align_customer_provisioning_trial.sql`
- `supabase/migrations/20261005160000_whatsapp_capture_review.sql`
- `supabase/migrations/20261005161000_review_whatsapp_capture_rpc.sql`
- `supabase/migrations/20261009103608_company_branding.sql`
- `supabase/migrations/20261009153132_company_modules.sql`
- `supabase/migrations/20261009153331_enforce_message_module.sql`
- `supabase/migrations/20261009153843_contact_custom_fields.sql`
- `supabase/migrations/20261009153928_contact_custom_value_rpc.sql`
- `supabase/migrations/20261009154359_create_with_contact_fields.sql`

## tests (28)

- `tests/auth-recovery.test.ts`
- `tests/business-acceptance.mjs`
- `tests/business-mutation-boundary.sql`
- `tests/business.test.ts`
- `tests/company-branding-boundary.sql`
- `tests/company-branding-integration.sql`
- `tests/company-branding.test.ts`
- `tests/company-modules-integration.sql`
- `tests/configurable-form-integration.sql`
- `tests/conflict-alerts.test.ts`
- `tests/contact-fields-integration.sql`
- `tests/contact-fields.test.ts`
- `tests/core-acceptance.sql`
- `tests/core-mutation-boundary.sql`
- `tests/crm-import-integration.sql`
- `tests/csv.test.ts`
- `tests/daily-acceptance.mjs`
- `tests/daily-mutation-boundary.sql`
- `tests/daily-production-rollback.sql`
- `tests/daily-work.test.ts`
- `tests/demo-acceptance.sql`
- `tests/execution.test.ts`
- `tests/local-supabase-bootstrap.sql`
- `tests/mobile-acceptance.mjs`
- `tests/opportunity-guidance.test.ts`
- `tests/public-release-smoke.mjs`
- `tests/rate-limit.test.ts`
- `tests/request-origin.test.ts`
