# QA core reproduzível

Este harness testa o app real com Supabase Auth, PostgreSQL, PostgREST e RLS **locais e descartáveis**. Não usa mock de autenticação, não muda produção e não envia WhatsApp. Credenciais ficam em arquivos privados do runner, fora dos artefatos.

Workflow: .github/workflows/core-acceptance.yml. O build usa overrides de Supabase que já existem em lib/supabase/config.ts. tests/mobile-acceptance.mjs exige API loopback e cria usuários pela Auth Admin API, nunca por SQL em auth.users. A fronteira RPC-only é aplicada somente na base local.

Cobre quatro viewports, captura/validação, próxima ação obrigatória, rollback, perdas/ganhos, reuso, WhatsApp auditado/callback, persistência, concorrência e isolamento. Artefatos: somente relatório sanitizado e screenshots de dados fictícios. Tempo de submit automatizado NÃO é medição humana de captura.

Estado inicial: preparado, execução/PASS ainda a conferir nos jobs do GitHub. Não substituir QA de produção por esse resultado; registrar exatamente o ambiente testado. Prompts 2–4 continuam bloqueados pelo gate do Prompt 1.
