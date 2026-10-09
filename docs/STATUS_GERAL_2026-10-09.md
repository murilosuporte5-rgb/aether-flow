# Aether Flow — estado geral e índice de arquivos

Atualizado em 09/10/2026. Código inspecionado na branch `codex/saas-core-2026-10-09`, commit `98bf676`. Este documento distingue funcionalidades presentes no repositório, verificações desta branch e tarefas ainda abertas. Registros antigos em `docs/` podem descrever estados históricos da produção.

## Onde está cada parte

| Assunto | Arquivos principais |
| --- | --- |
| Entrada e painel | `app/page.tsx`, `app/workspace-page.tsx`, `app/workspace.tsx`, `app/dashboard.tsx` |
| CRM e contatos | `app/core-form.tsx`, `app/contacts.tsx`, `app/contact-custom-fields.tsx`, `app/pipeline-settings.tsx`, `app/api/workspace/route.ts`, `app/api/operations/route.ts` |
| Banco e isolamento | `supabase/migrations/`, `tests/*-integration.sql`, `tests/*-boundary.sql`, `scripts/verify-local-postgres.sh` |
| Autenticação e equipe | `app/login/`, `app/activate/`, `app/team.tsx`, `app/api/team/`, `app/auth/` |
| Configuração por empresa | `app/configuracoes/`, `app/api/company-branding/`, `app/api/company-modules/`, `app/api/contact-fields/` |
| Landing e demonstração | `app/landing-page.tsx`, `app/landing/`, `app/demo/`, `app/landing-commercial-section.tsx` |
| Mensagens e WhatsApp | `app/message-bank.tsx`, `app/api/message-templates/`, `app/integracoes/whatsapp/`, `app/api/whatsapp/`, `app/api/webhooks/` |
| Ajuda e onboarding | `app/ajuda/page.tsx`, `app/feature-guide.tsx`, `app/onboarding.tsx` |
| Administração e importação | `app/admin/`, `app/api/admin/`, `app/business-operations.tsx`, `app/api/data/` |
| Testes e implantação | `tests/`, `.github/workflows/`, `README.md`, `docs/checkpoints/` |

## O que já existe no código

- Autenticação Supabase, acesso por empresa e papéis; criação administrativa de acesso e recuperação de senha.
- CRM com contatos, oportunidades, funil, responsáveis, tarefas/próximas ações, histórico, métricas e operações CSV. Algumas dessas capacidades já existiam antes desta branch.
- Landing com plano de R$ 67, rotas informativas, demonstração e links de ação. A apresentação do preço foi refinada nesta branch, sem mudar as condições comerciais.
- Captura manual/compartilhamento de contatos, modelos de mensagem, abertura do WhatsApp e código de conexão opcional via Evolution. A conexão efetiva depende de configuração externa; abertura de WhatsApp não comprova envio.
- Ajuda autenticada com instruções dos fluxos reais e atalho para o funil.
- Cor da empresa persistida com RLS. Módulo de mensagens ativável por empresa, com bloqueio na interface, API e RLS.
- Definições de campos de contato por empresa (texto, número ou data), edição no contato e preenchimento na criação de oportunidade. A criação e os campos são gravados juntos ou revertidos juntos.

## O que foi feito nesta branch

| Entrega | Commit | Evidência detalhada |
| --- | --- | --- |
| Cor por empresa e RLS | `a6e42b5` | `docs/checkpoints/2026-10-09-saas-core.md` |
| Card real do preço e acabamento | `23bdea8`, `9f80ea3` | `docs/checkpoints/2026-10-09-saas-core.md` |
| Central de ajuda | `715ba25` | `docs/checkpoints/2026-10-09-saas-core.md` |
| PostgreSQL local e testes de isolamento | `72eece9` | `docs/checkpoints/2026-10-09-local-postgres.md` |
| Módulo de mensagens por empresa; testes do CRM | `13ddb90` | `docs/checkpoints/2026-10-09-modules-crm.md` |
| Campos personalizados de contatos | `9775e72` | `docs/checkpoints/2026-10-09-contact-fields.md` |
| Campos no formulário de criação, gravação atômica | `98bf676` | `docs/checkpoints/2026-10-09-configurable-form.md` |

No último checkpoint: `npm run check`, 36 testes Node e `npm run build` passaram. O script `bash scripts/verify-local-postgres.sh` aplicou 49 migrações a um banco PostgreSQL novo e passou 11 testes SQL, incluindo papéis, isolamento entre duas empresas, persistência entre sessões, CRM, módulos e campos. O banco local usa um substituto SQL mínimo para `auth.uid()`; ele não executa o serviço completo Supabase Auth/PostgREST.

## O que ainda falta

### Validação necessária antes de lançamento desta branch

1. Executar esta branch em um ambiente de desenvolvimento com Supabase Auth e PostgREST reais, aplicar as migrações **nesse ambiente**, criar duas empresas e usuários de papéis diferentes.
2. Testar no navegador, em desktop e celular, login, troca de empresa, criação/edição de contatos, movimentação no Kanban, campos personalizados, liga/desliga do módulo, atualização da página e nova sessão. Registrar capturas e falhas. O build e os testes SQL locais não comprovam essa jornada.
3. Rever migrações/RLS e o comportamento da integração de WhatsApp com configuração de desenvolvimento. Não usar banco de produção para testes destrutivos.
4. Executar CI da branch e revisão final de acessibilidade/responsividade; corrigir regressões. Não há deploy desta branch em produção registrado nestes checkpoints.

### Funcionalidades pedidas que ainda não estão completas

1. **Personalização:** formulários completos configuráveis além dos campos de contato; dashboards configuráveis com persistência; modelos por nicho aplicáveis e reversíveis; mais módulos configuráveis além de mensagens; permissões específicas por módulo.
2. **CRM:** confirmação ponta a ponta no navegador de importação, deduplicação, responsáveis, histórico, tarefas, métricas e movimentação, inclusive falhas/recarregamento. Os testes SQL cobrem parte desses fluxos, não a experiência inteira.
3. **Automações:** construtor e executor de regras com validação, permissões, fila, retries, histórico e testes de falha. As ações guiadas existentes não equivalem a essa plataforma.
4. **Integrações:** conexão e sincronização confiável de serviços externos, com credenciais seguras, estados, retries e auditoria. A integração de WhatsApp presente depende de provedor/configuração externa.
5. **IA:** recursos reais com consentimento, privacidade, custo controlado e fallback. Não há conclusão verificada de uma IA integrada nesta branch.
6. **Onboarding e ensino:** revisar o fluxo autenticado, ampliar a ajuda contextual e produzir/gravar vídeos demonstrativos reais. A central de ajuda em texto não é vídeo.
7. **Landing:** revisão visual real nos principais tamanhos de tela e validação da conversão completa em ambiente de desenvolvimento. O refinamento do preço foi implementado, mas não equivale a um teste comercial completo.
8. **Operação e segurança:** recuperação/restauração testada, observabilidade, falhas injetadas no provisionamento, revisão de advisors do Supabase e proteção de senhas vazadas conforme disponibilidade do plano. Os documentos históricos registram pendências externas e não provam que foram resolvidas.

## Ordem recomendada para continuar

1. Levantar Supabase de desenvolvimento completo e fechar o teste autenticado de duas empresas.
2. Implementar dashboards configuráveis e modelos por nicho como checkpoints independentes, cada um com UI, banco, RLS e testes.
3. Validar e corrigir os fluxos CRM no navegador.
4. Implementar automações pequenas e auditáveis; depois integrações e IA com limites explícitos.
5. Fechar onboarding, vídeos e revisão visual/conversão da landing.

## Documentos complementares

- `docs/checkpoints/`: evidências de cada entrega recente.
- `docs/CORE_RELEASE.md` e `docs/SPRINT_CHECKPOINT.md`: histórico de versões anteriores; não representam, sozinhos, o estado da branch atual.
- `docs/AETHER_ENGAGEMENT_RESEARCH_2026.md` e `docs/AETHER_MARKET_UX_RESEARCH_2026.md`: pesquisa e ideias, não prova de implementação.
- `docs/MASTER_IMPLEMENTATION_HANDOFF_20260930.md`: handoff histórico e requisitos amplos.

## Pedido que guiou esta execução (transcrição do usuário)

O comando operacional mais recente e detalhado foi este, enviado antes de “Termina” e “Faça o que falta”:

> Codex Luna, diagnóstico recebido. Agora execute as correções e implementações necessárias, sem voltar para uma fase interminável de planejamento.
>
> PRIORIDADE 1 — DESTRAVAR O AMBIENTE
>
> Investigue a falta de espaço do Docker. Identifique o consumo de imagens, containers, volumes, caches e arquivos.
>
> Libere apenas recursos comprovadamente descartáveis. Não apague volumes, bancos, arquivos ou dados importantes sem autorização.
>
> Se o Docker continuar inviável, procure uma alternativa gratuita e isolada para executar PostgreSQL/Supabase em desenvolvimento. Não utilize o banco de produção para testes destrutivos.
>
> PRIORIDADE 2 — VALIDAR O BANCO REAL
>
> Aplique as migrações pendentes no ambiente de desenvolvimento.
>
> Crie duas empresas de teste e usuários com diferentes permissões.
>
> Comprove:
>
> - gravação e leitura no PostgreSQL;
> - persistência das configurações;
> - isolamento entre empresas;
> - políticas RLS;
> - permissões por papel;
> - impossibilidade de um usuário acessar registros de outra empresa;
> - comportamento após atualizar a página e iniciar uma nova sessão.
>
> PRIORIDADE 3 — PERSONALIZAÇÃO FUNCIONAL
>
> Não fique somente na cor da empresa.
>
> Implemente progressivamente:
>
> 1. módulos ativáveis por empresa;
> 2. campos personalizados;
> 3. formulários configuráveis;
> 4. dashboards personalizáveis;
> 5. modelos prontos por nicho.
>
> Cada funcionalidade precisa ter interface real, validação, persistência, permissões e testes.
>
> PRIORIDADE 4 — CONCLUIR O CRM
>
> Valide usando banco real:
>
> - cadastro de contatos;
> - criação e movimentação de oportunidades;
> - histórico;
> - responsáveis;
> - tarefas e próximos retornos;
> - importação CSV;
> - deduplicação;
> - métricas.
>
> Corrija os problemas encontrados.
>
> PRIORIDADE 5 — CONTINUAR A EVOLUÇÃO
>
> Depois avance para automações, integrações, landing page, IA, onboarding e tutoriais em vídeo.
>
> A pesquisa e engenharia reversa dos 20 concorrentes devem orientar decisões técnicas e visuais, mas não bloquear a entrega.
>
> REGRA DE EXECUÇÃO
>
> Não tente implementar tudo de uma vez.
>
> Execute checkpoints pequenos e completos. Em cada checkpoint:
>
> - altere código real;
> - integre frontend, backend e banco quando necessário;
> - execute testes;
> - verifique os fluxos no navegador;
> - registre evidências;
> - faça commit;
> - prossiga para a próxima tarefa.
>
> Não considere funcionalidade concluída apenas porque o build passou.
>
> Não altere produção, não gaste dinheiro e não exclua dados importantes sem aprovação.
>
> COMECE AGORA: resolva o bloqueio do banco, execute a migração e comprove o isolamento e a persistência com duas empresas diferentes. Depois continue automaticamente pelos próximos checkpoints independentes.
>
> Quero entregas verificáveis, não novos protótipos ou relatórios repetidos.

O pedido anterior ampliava o objetivo para autenticação, isolamento multiempresa, CRM persistente, automações, dashboards, personalização, landing, IA viável, onboarding e tutoriais. Depois o usuário disse **“Termina”**, **“Faça oque falta”** e pediu um inventário completo. Essas mensagens mantêm o objetivo amplo; os commits listados acima cobrem somente parte dele.

## Diário técnico desta etapa

+ **Ambiente:** Docker usava driver `vfs`; o inventário inicial mostrou zero imagens/containers/volumes/cache registrados. `docker system prune -f` liberou 0 B. A imagem grande de Supabase Postgres falhou ao descompactar por falta de espaço. Foi usado `postgres:16-alpine` no container `aether-dev-pg`, exposto só em `127.0.0.1:55432`. Volumes/bancos existentes não foram removidos.
+ **Banco de teste:** `tests/local-supabase-bootstrap.sql` cria o mínimo necessário de `auth` para migrações e testes SQL. `scripts/verify-local-postgres.sh` cria banco de teste novo, aplica as migrações e executa os testes. Os bancos de teste foram mantidos para inspeção; o script não os apaga.
+ **Isolamento:** testes com empresas A/B e perfis owner/admin/member confirmaram leitura e escrita conforme o papel, negação entre empresas e leitura após nova conexão. Isso é prova de PostgreSQL/RLS local; a troca de sessão no navegador continua pendente.
+ **Identidade visual:** `company_branding` guarda a cor; configuração permite owner/admin e workspace usa o valor. O teste cobre membro leitor, alteração por admin e negação entre empresas.
+ **Módulo de mensagens:** `company_modules` guarda `messages` por empresa. Interface, rota, API de modelos e políticas RLS respeitam a configuração. Desativar preserva os modelos, que reaparecem ao reativar.
+ **Campos de contato:** definições por empresa, até 20 campos de texto/número/data, com ativação/desativação sem apagar valores. Editor de contatos e RPC validam tipo, comprimento, data e propriedade. O formulário de oportunidade recolhe valores ativos e uma RPC cria a oportunidade e grava os campos de forma atômica.
+ **CRM:** testes SQL cobrem criação, mudança de etapa, histórico, importação e deduplicação; não foi concluída a jornada autenticada no navegador com Supabase completo.
+ **Apresentação:** o card de R$ 67 recebeu nova composição; a central de ajuda autenticada foi ligada ao workspace. Não há vídeo gravado.
+
## Arquivos novos ou modificados nos checkpoints desta branch

Esta lista usa `git show --name-only` nos commits citados e agrupa arquivos repetidos uma vez por tema:

- **Identidade da empresa:** `lib/company-branding.ts`, `app/configuracoes/branding-form.tsx`, `app/api/company-branding/route.ts`, `supabase/migrations/20261009103608_company_branding.sql`, `tests/company-branding-boundary.sql`, `tests/company-branding-integration.sql`, `tests/company-branding.test.ts`.
- **Landing e ajuda:** `app/landing-commercial-section.tsx`, `app/ajuda/page.tsx`, `app/page.tsx`, `app/workspace-page.tsx`, `app/globals.css`.
- **Banco local:** `tests/local-supabase-bootstrap.sql`, `scripts/verify-local-postgres.sh`.
- **Módulos e mensagens:** `lib/company-modules.ts`, `app/api/company-modules/route.ts`, `app/api/message-templates/route.ts`, `app/configuracoes/modules-form.tsx`, `app/mensagens/messages-client.tsx`, `app/mensagens/page.tsx`, `supabase/migrations/20261009153132_company_modules.sql`, `supabase/migrations/20261009153331_enforce_message_module.sql`, `tests/company-modules-integration.sql`, `tests/crm-import-integration.sql`.
- **Campos e formulário:** `lib/contact-fields.ts`, `app/configuracoes/contact-fields-form.tsx`, `app/contact-custom-fields.tsx`, `app/api/contact-fields/route.ts`, `app/api/contacts/custom-field/route.ts`, `app/contacts.tsx`, `app/core-form.tsx`, `supabase/migrations/20261009153843_contact_custom_fields.sql`, `supabase/migrations/20261009153928_contact_custom_value_rpc.sql`, `supabase/migrations/20261009154359_create_with_contact_fields.sql`, `tests/contact-fields-integration.sql`, `tests/contact-fields.test.ts`, `tests/configurable-form-integration.sql`.
- **Integração entre telas e API:** `app/configuracoes/page.tsx`, `app/workspace.tsx`, `app/api/workspace/route.ts`, `app/demo/demo-workspace.tsx`.
- **Registros:** os cinco arquivos em `docs/checkpoints/2026-10-09-*.md`.

## Interpretação dos testes e estado de publicação

- **Passou:** TypeScript, 36 testes Node, build e os 11 testes SQL do último checkpoint. O teste SQL aplica as 49 migrações do repositório em banco de teste vazio.
- **Parcial:** PostgreSQL e RLS reais foram exercitados localmente, mas o serviço de Auth/PostgREST foi simulado apenas na fronteira SQL. A suíte histórica CI de versões anteriores não é prova automática de que esta branch atual passou pelo mesmo gate.
- **Não testado nesta branch:** login real de duas empresas, refresh e nova sessão no navegador, fluxo inteiro de Kanban/contatos em desktop e celular, entrega de mensagens no provedor externo, vídeos, revisão visual final de todas as telas.
- **Publicação:** branch enviada ao GitHub; os checkpoints desta branch não registram merge, aplicação das novas migrações no Supabase remoto nem deploy de produção. A produção não foi modificada por esta etapa.

## Lista integral de arquivos

Para localizar **todos os arquivos versionados do repositório**, consulte `docs/INVENTARIO_ARQUIVOS_2026-10-09.md`. É um índice de caminhos; as seções acima explicam o papel dos arquivos principais e o estado de implementação.
