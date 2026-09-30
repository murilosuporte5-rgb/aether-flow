# Aether Flow — release do núcleo

Referência: 30/09/2026, 21:17 UTC. Escopo: Prompt 1; o programa de quatro prompts ainda não está concluído. Nenhuma mensagem comercial/WhatsApp enviada. Nenhuma senha lida/trocada.

## Estado verificado

- Código validado: 1bfc34cfa8fc3cff78687eca34d5e7092b2657bc, branch core-execution-20260930, PR #13.
- Railway QA: d38216c2-1a8a-4bbc-bc6f-949d8e668370 SUCCESS, SHA exato acima; /api/health e /login HTTP 200. Fonte temporariamente core-execution; retorno main após merge é o último gate de publicação.
- Supabase: xffwvvcmeqzimnuqqtus, 16 migrations sincronizadas. 20260930211138_core_final_mutation_boundary aplicada após QA do runtime aprovado. Escrita operacional direta authenticated/anon revogada; authenticated SELECT preservado. Escritas usam RPCs protegidas.
- Dados finais após limpeza exclusiva dos fixtures criados nesta auditoria: 2 empresas, 3 perfis e zero contatos/oportunidades/atividades/histórico/receipts. Empresas/usuários preexistentes preservados.

## Entrega

Conclusão atômica com próxima ação ou ganho/perda; perda controlada/Outro obrigatório; captura compacta; normalização +E.164 e telefone único por empresa; reutilização explícita; receipts idempotentes; WhatsApp oficial auditado somente como abertura; indicadores 3/7 dias e prioridades determinísticas; histórico; demo atômica; captura fixa mobile acima da navegação.

Corrigidos nesta rodada: FAB interceptado pela navegação em 360px; captura habilitada antes de carregar empresa/estágios; recarga redundante e respostas antigas substituindo snapshot recente. Não houve relaxamento de autorização ou origem HTTP.

## Evidência

- Local: npm test 11 PASS, TypeScript PASS, produção build PASS após os ajustes finais. git diff --check PASS.
- GitHub Actions 36776123956/job 110094343600 SUCCESS: Auth/PostgreSQL/PostgREST/RLS reais e descartáveis, 52 grupos PASS (13×360/390/412/768), sem falhas de limpeza. Build/TypeScript/ACL/runtime HTTP PASS. Relatório sanitizado docs/qa/core-mobile-20260930/summary.json; quatro screenshots inspecionadas. https://github.com/murilosuporte5-rgb/aether-flow/actions/runs/36776123956
- Inclui concorrência PostgREST (contato único e request_id idempotente), isolamento adversarial entre dois tenants, rollback de falha da próxima ação, ganho/perda/Outro, persistência após reload, Escape, layout e callback de abertura WhatsApp. Não comprova uso do aplicativo WhatsApp nem envio; wa.me é interceptado no teste.
- Produção desktop autenticado sob grants finais: duplicidade avisada/reuso explícito; oportunidade criada; Ligação agendada; concluída junto com Follow-up futuro; SQL confirmou 1 done, 1 pending, 4 eventos, próxima ação 03/10/2026 12:00 UTC, last_interaction_at nulo porque contato não foi declarado. Dados fictícios removidos depois, com guard por ID/empresa/nome/telefone/títulos.
- tests/core-mutation-boundary.sql novamente PASS no banco remoto após ativação final: ACL RPC, matriz de grants, 12 INSERT/UPDATE/DELETE diretos authenticated e 4 SELECT anon negados; nenhuma escrita persistente.
- Testes históricos core 23 e demo 5 PASS; não confundir fixtures SQL históricos com o novo harness que cria Auth users exclusivamente pela Auth Admin API.

## Limites

Tempo humano de captura 15–20s NOT_MEASURED. Latência de submit automatizado não substitui esse teste. Mobile autenticado passou no ambiente isolado; produção autenticada validada em desktop. Não afirmamos mobile físico em produção. Health é liveness, não saúde completa do banco.

## Rollback

Main anterior f08f9157fc0786afd2b0d20529f1e260d87f38a5, deployment retido 5c02f4be-f7fa-4305-af81-28dea223c9ad, imagem verificada disponível antes da ativação. Runtime antigo exige primeiro NOVA migration que restaure mínimos SELECT/INSERT/UPDATE em contacts/opportunities/activities e SELECT/INSERT em history. Preservar RLS; não conceder ALL/anon; não remover schema/dados. Só depois publicar imagem/commit antigo e confirmar SUCCESS/health/escritas. Não replay migrations históricas.

## Pendências para clientes reais / próximos sprints

- Compensação de create-access não verifica cleanup; auditar/corrigir antes de provisionar primeiro cliente real.
- Advisor Auth: leaked-password protection desabilitada, não corrigida nesta rodada.
- SECURITY DEFINER de RPC operacional/demo intencional: auth.uid obrigatório, membership/dono por empresa, parâmetros limitados, search_path vazio, PUBLIC/anon revogados; aceito para fronteira transacional, com testes adversariais. Não significa auditoria completa Prompt 4.
- Performance advisors: FK actor de receipts sem índice e políticas permissivas de onboarding exigem análise posterior; índices sem uso em base sem dados não foram removidos.
- Prompts 2–4: fila Resolver Pendências/pipeline/Contatos/busca/feedback; métricas/CSV/admin/trial/export; hardening/recovery/E2E final. Não contabilizados como concluídos.
