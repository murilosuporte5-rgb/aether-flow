# Checkpoint Aether Flow — 2026-10-03

## Decisões

- Seguir somente `docs/CODEX_AETHER_CAPTURE_UX_PROMPT.md`; preservar fluxos existentes.
- Undo limitado a mudanças entre etapas abertas, com verificação server-side do estágio atual.
- Menu mobile usa drawer compacto; seleção de Alertas exige a aba Hoje ativa e o fundo fecha o drawer.
- Datas usam `America/Bahia` e `TIME_ZONE_OFFSET` centralizado.
- O prompt do GitHub foi atualizado para a reta final; o checkpoint ativo agora é Mobile Primeiro. A configuração anterior DM Sans/Manrope foi restaurada por solicitação do usuário.
- O Focus Mode foi revisado e mantido: fila persistente, progresso, continuidade após WhatsApp e saída já estão presentes. O briefing recebeu apenas o refinamento para exibir o combinado e uma indicação curta do que resolver antes da conversa.
- NBA/Momentum foram revisados contra os dados disponíveis: as regras continuam determinísticas, explicáveis e limitadas a responsável, próxima ação, atraso, interação recente e tempo na etapa. Não houve evidência para alterar o comportamento.

## Evidências

- Supabase `xffwvvcmeqzimnuqqtus`: migrations de operações, termos e Undo aplicadas; `terms_acceptances`, `accept_terms` e `undo_stage_change` existem.
- Railway deployment anterior de aplicação: `success`; health `200` com banco protegido. Ajustes do drawer estão em `main` nos commits `fde1442` e `683226e`.
- Smoke público: `PASS` em health, login, Capture, recuperação, termos, privacidade e redirecionamento protegido de contatos.
- `npm test`: 33/33; `npm run check`: PASS; `npm run build`: PASS.
- QA autenticado de produção: sem overflow horizontal em 360, 390, 768, 1024, 1366 e 1440 px; drawer em 360/390 px mede 200 px, sem overflow interno; Alertas fica como único item ativo; toque fora fecha.
- Reta final Mobile Primeiro: ajuste concreto em 320–430 px para reduzir hero, cabeçalho, tutorial e espaçamento sem alterar desktop; landing local medida sem overflow em 320 px.
- Reta final Focus Mode/WhatsApp: alteração pequena em `app/workspace.tsx`, validada com testes, typecheck e build.
- CSP aplicada e mantida em Report-Only para diagnóstico: removido `unsafe-eval`; build e login local sob a política aplicada carregaram sem erros de console. Headers públicos confirmados após o deploy `2fe80f7`.

## Pendências reais

- Capturas visuais persistentes nos seis viewports ainda não foram arquivadas; a medição DOM e o teste de interação em produção foram concluídos.
- Proteção contra senhas vazadas permanece fora deste ciclo por decisão explícita do usuário; não é bloqueio de execução agora.
- Advisors Supabase mantêm avisos sobre funções `SECURITY DEFINER` intencionais e índices ainda sem uso observado; não há alteração especulativa.
