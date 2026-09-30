# Aether Flow — publicação do núcleo

Estado de referência: 30/09/2026. Scope: Prompt 1. Os Prompts 2–4 aguardam estabilização desta camada. Nenhuma mensagem comercial/WhatsApp foi enviada.

## Fontes e estado atual

- GitHub: murilosuporte5-rgb/aether-flow; branch core-execution-20260930; PR #13 em rascunho, sem merge.
- Main/runtime de produção: f08f9157fc0786afd2b0d20529f1e260d87f38a5.
- Railway project: 0d6c6fca-ca81-4da4-a5af-ee91f0dfd3ee.
- Production environment: 22f8e56e-2391-4480-9a6f-3d1f93f11f70; service: 160fec62-b04d-466b-9c52-4a3f0b40cd82.
- Restore atual: 5c02f4be-f7fa-4305-af81-28dea223c9ad SUCCESS, confirmado em 16:32:07 UTC; config main/SHA/healthcheck /login 30s; endpoint HTTP 200.
- Supabase Flow: xffwvvcmeqzimnuqqtus. Dados preservados: 2 empresas, 3 perfis; zero linhas operacionais após limpeza de QA.
- Documentação completa: IMPLEMENTATION_STATUS.md e MASTER_IMPLEMENTATION_HANDOFF_20260930.md.

## Núcleo implementado na branch

RPC apply_workspace_command tenant-scoped/transacional; próxima ação obrigatória ou ganho/perda; motivo controlado; telefone normalizado/unique por empresa; reutilização explícita; receipts idempotentes; formulário compacto; abertura oficial wa.me auditada sem falsa interação; indicadores 3/7 dias; prioridades determinísticas; demo atômica/idempotente; health de liveness.

## Evidências

- npm test 11 PASS; TypeScript e build PASS na revisão de código testada.
- SQL core 23 PASS; demo 5 PASS, fixtures revertidos.
- Desktop autenticado: criação/validação/duplicidade, conclusão+próxima ação, ganho/perda/Outro, histórico, persistência e agendamento Hoje PASS.
- HTTP simultâneo: duas requisições sobrepostas 200/409; um contato/uma oportunidade. Não comprova overlap interno de transações PostgreSQL.
- QA Railway f188cf1a-6f31-4d10-a5c8-52af5ff2c071 (7456843) SUCCESS. QA adicional 735191e1-3fa1-4e89-bb02-191c137206b3 (e37f685) SUCCESS, health HTTP 200.
- Jarvis RC51 auditou login público 360/390/412/768 na branch e37: HTTP 200, sem overflow/erros. **Mobile autenticado continua NOT_TESTED.**
- tests/core-mutation-boundary.sql PASS durante ativação RPC-only: ACL, execução RPC, 12 mutações diretas authenticated e 4 SELECTs anon negados. Core/demo também PASS sob RPC-only.

## Migrations e grants

Quinze migrations remotas sincronizadas, incluindo cinco novas: 20260930130958 core; 20260930132228 demo; 20260930134524 international; 20260930162312 boundary; 20260930163119 legacy restore.

A última migration restaura compatibilidade com main: authenticated SELECT/INSERT/UPDATE em contacts/opportunities/activities; SELECT/INSERT em opportunity_history. DELETE/TRUNCATE/REFERENCES/TRIGGER permanecem revogados; anon sem acesso. RLS preservada. Portanto a fronteira RPC-only foi testada, mas não está definitivamente ativa.

O template docs/pending/core_mutation_boundary.sql exige **nova migration** para ativação final. Não editar/reexecutar uma versão histórica como se ela não tivesse sido aplicada. Core 23 PASS novamente após restore de grants.

## Próxima publicação

1. Conferir HEAD/main, schema/grants e migrations reais; rebase/retestar se houver alterações.
2. Confirmar rollback disponível para o SHA/imagem de produção e compatibilidade do banco.
3. Testar a revisão exata da branch na Railway, preservando domínio/config/variáveis.
4. Concluir mobile autenticado core; verificar callback de WhatsApp e medir captura.
5. Com runtime transacional aprovado ativo, gerar/aplicar nova migration RPC-only, sincronizar versão; retestar boundary/core/demo e UI autenticada.
6. Conferir TypeScript/build/runtime/health e revisão; merge somente após todos os gates.
7. Devolver fonte Railway para main; confirmar deployment SUCCESS, commit correto, health e fluxo principal.

Não iniciar Prompt 2 antes disso. Se gates bloquearem, restaurar permissões necessárias ao runtime antigo ANTES de restaurá-lo e terminar com main/SUCCESS confirmado.

## Rollback

Colunas/tabelas/RPCs aditivos podem permanecer; não executar down migration destrutiva. Se RPC-only estiver ativo, usar nova migration rastreada que restaure somente os grants necessários ao runtime antigo. Não conceder ALL ou anon; preservar RLS e revogações não necessárias ao legacy.

Selecionar imagem SUCCESS retida na Railway e confirmar rollback/SHA/status. Se não estiver disponível, publicar o commit de recuperação verificado. Reconferir /login e escritas com fixture isolado. Não assumir rollback concluído por uma mensagem do agente ainda INITIALIZING.

## Pendências fora do núcleo

Compensação administrativa não confere cleanup; onboarding real requer auditoria. Leaked-password protection desabilitada conforme advisor. RPC SECURITY DEFINER protegidas/intencionais precisam da revisão final. Performance/snapshot sem volume relevante, admin/trial/reset/CSV/export e RLS completa aguardam seus sprints.

Login fornecido pelo usuário funcionou; nenhuma senha lida/trocada. Jarvis governado usado apenas para status/auditoria pública, sem effects/kill-switch alteração ou bypass de autenticação.
