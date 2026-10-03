# Checkpoint Aether Flow — 2026-10-03

## Decisões

- Seguir somente `docs/CODEX_AETHER_CAPTURE_UX_PROMPT.md`; preservar fluxos existentes.
- Undo limitado a mudanças entre etapas abertas, com verificação server-side do estágio atual.
- Menu mobile usa drawer compacto; seleção de Alertas exige a aba Hoje ativa e o fundo fecha o drawer.
- Datas usam `America/Bahia` e `TIME_ZONE_OFFSET` centralizado.

## Evidências

- Supabase `xffwvvcmeqzimnuqqtus`: migrations de operações, termos e Undo aplicadas; `terms_acceptances`, `accept_terms` e `undo_stage_change` existem.
- Railway deployment anterior de aplicação: `success`; health `200` com banco protegido. Ajustes do drawer estão em `main` nos commits `fde1442` e `683226e`.
- Smoke público: `PASS` em health, login, Capture, recuperação, termos, privacidade e redirecionamento protegido de contatos.
- `npm test`: 33/33; `npm run check`: PASS; `npm run build`: PASS.
- QA autenticado de produção: sem overflow horizontal em 360, 390, 768, 1024, 1366 e 1440 px; drawer em 360/390 px mede 200 px, sem overflow interno; Alertas fica como único item ativo; toque fora fecha.

## Pendências reais

- Capturas visuais persistentes nos seis viewports ainda não foram arquivadas; a medição DOM e o teste de interação em produção foram concluídos.
- Proteção contra senhas vazadas continua desativada no plano/configuração atual do Supabase.
- Advisors Supabase mantêm avisos sobre funções `SECURITY DEFINER` intencionais e índices ainda sem uso observado; não há alteração especulativa.
