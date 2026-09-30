# QA core reproduzível

Este harness testa o app real com Supabase Auth, PostgreSQL, PostgREST e RLS **locais e descartáveis**. Não usa mock de autenticação, não muda produção e não envia WhatsApp. Credenciais ficam em arquivos privados do runner, fora dos artefatos.

Workflow: .github/workflows/core-acceptance.yml. O build usa overrides de Supabase que já existem em lib/supabase/config.ts. tests/mobile-acceptance.mjs exige API loopback e cria usuários pela Auth Admin API, nunca por SQL em auth.users. A fronteira RPC-only é aplicada somente na base local.

Cobre quatro viewports, captura/validação, próxima ação obrigatória, rollback, perdas/ganhos, reuso, WhatsApp auditado/callback, persistência, concorrência e isolamento. Artefatos: somente relatório sanitizado e screenshots de dados fictícios. Tempo de submit automatizado NÃO é medição humana de captura.

Execução confirmada: GitHub Actions 36776123956, commit 1bfc34cfa8fc3cff78687eca34d5e7092b2657bc, job 110094343600 SUCCESS. 52 grupos PASS (13 por largura 360/390/412/768), sem falhas de limpeza. Build, TypeScript, 11 testes de domínio/origem, ACL e runtime HTTP passaram. Screenshots dos quatro viewports foram inspecionadas: captura fixa acima da navegação, sem overflow. Relatório sanitizado versionado em core-mobile-20260930/summary.json.

Fonte: https://github.com/murilosuporte5-rgb/aether-flow/actions/runs/36776123956. Este resultado usa Auth e banco reais descartáveis; não equivale a mobile de produção. A validação autenticada desktop na Railway é registrada em CORE_RELEASE.md. Tempo humano de captura permanece NOT_MEASURED.
