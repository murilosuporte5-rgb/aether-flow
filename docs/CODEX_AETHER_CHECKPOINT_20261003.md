# Checkpoint Aether Flow — 2026-10-03

## Decisões

- Seguir somente `docs/CODEX_AETHER_CAPTURE_UX_PROMPT.md`; preservar fluxos existentes.
- Undo limitado a mudanças entre etapas abertas, com verificação server-side do estágio atual.
- Menu mobile usa drawer compacto; seleção de Alertas exige a aba Hoje ativa.
- Datas usam `America/Bahia` e `TIME_ZONE_OFFSET` centralizado.

## Evidências

- Supabase `xffwvvcmeqzimnuqqtus`: migrations de operações, termos e Undo aplicadas; `terms_acceptances`, `accept_terms` e `undo_stage_change` existem.
- Railway deployment `6830561474` / commit `2d8ec12`: `success`; health `200` com banco protegido.
- Smoke público: `PASS` em health, login, Capture, recuperação, termos, privacidade e redirecionamento protegido de contatos.
- `npm test`: 33/33; `npm run check`: PASS; `npm run build`: PASS.

## Pendências reais

- QA autenticado em produção e screenshots nos seis viewports ainda não têm evidência completa.
- Proteção contra senhas vazadas continua desativada no plano/configuração atual do Supabase.
- Advisors Supabase mantêm avisos sobre funções `SECURITY DEFINER` intencionais e índices ainda sem uso observado; não há alteração especulativa.
