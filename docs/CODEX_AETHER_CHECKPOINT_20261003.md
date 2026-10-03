# Checkpoint Aether Flow — 2026-10-03

## Decisões

- Seguir somente `docs/CODEX_AETHER_CAPTURE_UX_PROMPT.md`; preservar fluxos existentes.
- Undo limitado a mudanças entre etapas abertas, com verificação server-side do estágio atual.
- Menu mobile usa drawer compacto; seleção de Alertas exige a aba Hoje ativa e o fundo fecha o drawer.
- Datas usam `America/Bahia` e `TIME_ZONE_OFFSET` centralizado.
- O prompt do GitHub foi atualizado para a reta final; o checkpoint ativo agora é Mobile Primeiro. A configuração anterior DM Sans/Manrope foi restaurada por solicitação do usuário.
- O Focus Mode foi revisado e mantido: fila persistente, progresso, continuidade após WhatsApp e saída já estão presentes. O briefing recebeu apenas o refinamento para exibir o combinado e uma indicação curta do que resolver antes da conversa.
- NBA/Momentum foram revisados contra os dados disponíveis: as regras continuam determinísticas, explicáveis e limitadas a responsável, próxima ação, atraso, interação recente e tempo na etapa. Não houve evidência para alterar o comportamento.
- Acabamento do app: `Resolver pendências` voltou a preceder painéis secundários; o skeleton agora descreve e dimensiona a aba carregada.
- Landing: a galeria aparece antes dos cards em `Telas reais`; a rotação automática pausa durante leitura/interação e respeita movimento reduzido.
- Performance e segurança: INP usa interações únicas, CLS usa janelas de sessão, e ativação administrativa, onboarding e mutações da equipe receberam limite server-side.
- Revisão visual baseada nos 21 apontamentos de produção: drawer mobile passou a ter altura do conteúdo, textos do pipeline receberam margens consistentes, feedback ficou compacto, ações da Operação foram equilibradas e a saída duplicada foi removida do cabeçalho.
- Capture no computador agora explica o fluxo real da extensão e abre o WhatsApp Web, mantendo o formulário manual para celular.
- Landing: galeria principal avança automaticamente com pausa por interação e movimento reduzido; prova mobile usa moldura vertical sem contador; cartões e rodapé levam às páginas temáticas existentes.
- A página dedicada de recursos foi alinhada aos nove cartões da landing; cada cartão agora abre diretamente a explicação correspondente em vez de terminar em uma âncora sem destino.
- Identidade: o símbolo em fita ciano/azul enviado e aprovado pelo usuário substituiu a marca provisória no app, login, landing e favicon. O arquivo foi otimizado localmente de 540 KB para 28 KB sem nova geração.
- Segurança complementar: o Capture remove o fragmento PII da URL após a leitura, e mutações autenticadas do workspace têm limite server-side com resposta `429` e `Retry-After`.

## Evidências

- Supabase `xffwvvcmeqzimnuqqtus`: migrations de operações, termos e Undo aplicadas; `terms_acceptances`, `accept_terms` e `undo_stage_change` existem.
- Railway deployment anterior de aplicação: `success`; health `200` com banco protegido. Ajustes do drawer estão em `main` nos commits `fde1442` e `683226e`.
- Smoke público: `PASS` em health, login, Capture, recuperação, termos, privacidade e redirecionamento protegido de contatos.
- `npm test`: 33/33; `npm run check`: PASS; `npm run build`: PASS.
- QA autenticado de produção: sem overflow horizontal em 360, 390, 768, 1024, 1366 e 1440 px; drawer em 360/390 px mede 200 px, sem overflow interno; Alertas fica como único item ativo; toque fora fecha.
- Reta final Mobile Primeiro: ajuste concreto em 320–430 px para reduzir hero, cabeçalho, tutorial e espaçamento sem alterar desktop; landing local medida sem overflow em 320 px.
- Reta final Focus Mode/WhatsApp: alteração pequena em `app/workspace.tsx`, validada com testes, typecheck e build.
- Matriz do aceite visual ampliada para 320, 360, 390, 412, 430, 768, 1024, 1366 e 1440 px; o arquivo passou em validação sintática. A execução completa continua dependendo do ambiente local descartável do Supabase.
- `npm test`: 33/33 após o acabamento; `npm run check`, `npm run build`, `node --check tests/mobile-acceptance.mjs` e `git diff --check`: PASS.
- Produção após `06e4a32`: `/landing/telas` passou a expor `landing-sub-gallery-first`, health retornou `200` com banco `protected`, e `tests/public-release-smoke.mjs` retornou `PASS` para login, Capture, recuperação, termos, privacidade e redirecionamento autenticado.
- CSP aplicada e mantida em Report-Only para diagnóstico: removido `unsafe-eval`; build e login local sob a política aplicada carregaram sem erros de console. Headers públicos confirmados após o deploy `2fe80f7`.
- Lote visual de 03/10: `npm test` 33/33, `npm run check`, `npm run build` e `git diff --check` passaram. Landing e login foram revisados no navegador local; a nova marca aparece com contraste correto em fundo claro e escuro.
- Auditoria de segurança: produção retorna CSP efetiva, HSTS, `nosniff`, `X-Frame-Options: DENY` e Permissions-Policy restritiva; a extensão mantém `permissions: []` e só acessa `web.whatsapp.com`. O acceptance autenticado do SHA atual segue sem execução por ausência do runtime Supabase local.

## Pendências reais

- A seção `Também no celular` agora tem moldura vertical, mas ainda depende dos sete PNGs horizontais atuais; gerar capturas verticais reais continua pendente e não será simulada uma imagem falsa.
- Proteção contra senhas vazadas permanece fora deste ciclo por decisão explícita do usuário; não é bloqueio de execução agora.
- Advisors Supabase mantêm avisos sobre funções `SECURITY DEFINER` intencionais e índices ainda sem uso observado; não há alteração especulativa.
- QA final ainda não pode ser declarado completo: faltam screenshots/revisão visual autenticada do SHA atual nas nove larguras, logout/login autenticado e execução do fluxo Capture pela UI. Os scripts existem, mas dependem do Supabase descartável local.
