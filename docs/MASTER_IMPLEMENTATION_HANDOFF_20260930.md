# AETHER FLOW — PROMPT MESTRE DE CONTINUIDADE E CONCLUSÃO DO MVP

**Data de referência: 30/09/2026.** Documento para copiar integralmente em uma nova sessão de implementação. Os estados abaixo representam evidências disponíveis nesta data; devem ser reconferidos antes de novas alterações.

---

## 1. Missão, responsabilidade e resultado esperado

Você trabalha no **Aether Flow**, produto da **Aether Works**. Atue como Principal Product Engineer, Senior Full-Stack Engineer, PostgreSQL Architect, Supabase Security Engineer, Workflow Architect, UX Engineer, QA Lead e Release Manager.

Sua missão é **continuar o trabalho existente e terminar o MVP**, respeitando a sequência dos quatro sprints descritos neste prompt. Leia o código e confronte o estado real antes de implementar. Não reconstrua funcionalidades que já existem, não confunda documentação com funcionamento e não declare o programa concluído porque uma branch compila.

Proposta nuclear:

> Impedir que oportunidades comerciais sejam esquecidas, garantindo que cada negociação possua estado, responsável, histórico e principalmente um próximo passo operacional claro.

Ciclo que o produto precisa sustentar:

**Cliente → oportunidade → contato → ação → resultado → próximo passo.**

O produto deve orientar execução diária, com captura rápida, confiança no histórico e isolamento entre empresas. Não deve evoluir para um CRM genérico, pesado ou cheio de funcionalidades sem validação.

Não execute ações comerciais, não envie WhatsApp ou e-mail, não contate prospects e não movimente dinheiro. Preparar ou testar o produto não autoriza enviar mensagens. O deep link do WhatsApp é uma ação deliberada do usuário e nunca um disparo automático.

## 2. Invariantes obrigatórios

- **NO EVIDENCE = NO CLAIM:** toda afirmação importante deve apontar código, consulta, teste, log ou verificação observada.
- **NO SILENT FAILURE:** mostrar falha recuperável; não exibir sucesso quando uma operação obrigatória falhou.
- **NO PARTIAL WRITE WITHOUT COMPENSATION:** operações de domínio devem ser transacionais; operações externas precisam de compensação conferida e procedimento de recuperação.
- **NO CROSS-TENANT DATA ACCESS:** impedir leitura, escrita e referências entre empresas no banco e no servidor.
- **NO SECURITY BY UI ONLY:** ocultar botão não substitui autorização, RLS, grants ou checagem server-side.
- **NO SERVICE_ROLE IN CLIENT:** secrets somente no servidor/Edge Function; nunca em bundle, resposta, log ou documento.
- **NO DIRECT AUTH.USERS MANIPULATION:** usar Supabase Auth Admin API para administração de usuários.
- **NO BREAKING PRODUCTION WITHOUT VERIFIED ROLLBACK:** conhecer imagem/commit de recuperação e compatibilidade de permissões antes de trocar runtime.
- **NO FEATURE WITHOUT ACCEPTANCE TESTS:** incluir teste proporcional à regra, principalmente integridade, autorização e concorrência.
- **NO AUTOMATION THAT CAN DUPLICATE BUSINESS DATA:** proteger retries, requisições concorrentes e importação contra duplicação.
- **NO NEW COMPLEXITY WITHOUT DIRECT MVP VALUE:** implementar a solução mais simples que atende o requisito.

Classifique os resultados como **IMPLEMENTADO NA BRANCH**, **PUBLICADO**, **PASS**, **FAIL**, **PARTIAL**, **NOT_TESTED**, **BLOCKED** ou **POSTERGADO**. Não converta uma hipótese em PASS. Separe observação, interpretação e pendência.

## 3. Stack e fontes canônicas

Stack observada no repositório:

| Camada | Estado |
|---|---|
| Aplicação | Next.js 16.3.7, App Router |
| UI | React 19.2.6, TypeScript strict, Tailwind 4.2.1 |
| Auth/dados | Supabase Auth, PostgreSQL, RLS, Edge Functions |
| Hospedagem | Railway, ambiente production |
| Domínio | Multiempresa; contato e oportunidade são entidades distintas |
| Código canônico | GitHub: `murilosuporte5-rgb/aether-flow` |
| Runtime local observado | Node 24.19; npm 11.9 |

Leia primeiro, nesta ordem:

1. Estado atual do GitHub, branch, PR e diff contra main.
2. `docs/IMPLEMENTATION_STATUS.md` e `docs/CORE_RELEASE.md`.
3. `app/api/workspace/route.ts`, `app/workspace.tsx`, `app/core-form.tsx`, `app/dashboard.tsx`.
4. `lib/execution.ts`, `lib/request-origin.ts`, `lib/provision.ts` e `lib/templates.ts`.
5. Todas as migrations; schema, grants, policies, funções e histórico de migrations do Supabase real.
6. `tests/*.test.ts`, `tests/core-acceptance.sql`, `tests/demo-acceptance.sql`, `tests/core-mutation-boundary.sql`.
7. Auth, onboarding, `/admin`, rotas administrativas e `supabase/functions/create-access/index.ts`.
8. Configuração e deployment real da Railway; logs e healthcheck.

Em uma nova sessão, não assuma que arquivos locais, SHA ou contagens continuam iguais. Confirme. Se main avançou, examine o diff e faça reconciliação antes de publicar. Siga qualquer `AGENTS.md` aplicável se passar a existir.

## 4. Estado real ao encerrar esta rodada

### 4.1 Código e publicação

- Repositório: https://github.com/murilosuporte5-rgb/aether-flow.
- Branch de implementação: **`core-execution-20260930`**.
- PR **#13 em rascunho**: https://github.com/murilosuporte5-rgb/aether-flow/pull/13.
- Código funcional testado no desktop: **`74568433127876192f09cb2900b820dc694f86d3`**.
- Revisão posterior testada no login pelo Jarvis: **`e37f6855e82edf43dd162e819b5370f688ee24a1`**; contém o mesmo código operacional e documentação/evidência adicional.
- Este documento e as últimas migrations/testes de grants acrescentam documentação e SQL; consulte o HEAD atual do PR para a revisão final desses arquivos.
- **Não houve merge do Prompt 1 em main.** Os novos recursos não devem ser tratados como release definitivo.
- Produção foi restaurada para **main**, commit **`f08f9157fc0786afd2b0d20529f1e260d87f38a5`**.
- Deployment atual confirmado: **`5c02f4be-f7fa-4305-af81-28dea223c9ad`**, **SUCCESS**, atualizado em **30/09/2026 16:32:07 UTC**.
- Configuração independente confirmou branch main, SHA exato, healthcheck `/login`, timeout 30 segundos, uma réplica em sfo.
- `/login` respondeu **HTTP 200** após a restauração. Isso comprova resposta do endpoint, não todos os fluxos de dados.
- Domínio: https://aether-flow-production-0798.up.railway.app.

### 4.2 Identificadores operacionais

| Recurso | Identificador |
|---|---|
| Railway project | `0d6c6fca-ca81-4da4-a5af-ee91f0dfd3ee` |
| Railway production environment | `22f8e56e-2391-4480-9a6f-3d1f93f11f70` |
| Railway service | `160fec62-b04d-466b-9c52-4a3f0b40cd82` |
| Supabase do Aether Flow | `xffwvvcmeqzimnuqqtus` |
| Supabase do Jarvis, separado | `axzytmvqszekdkpaodpk` |

Não misture os bancos. Não copie credenciais ou valores de variáveis para o handoff. A inspeção da Railway mostrou o nome `DEMO_ACCESS_KEY`; seu valor não foi exposto nem alterado.

### 4.3 Banco aplicado e permissões atuais

Foram confirmadas **15 migrations aplicadas**: dez preexistentes e cinco desta implementação.

| Migration nova | Estado e significado |
|---|---|
| `20260930130958_core_execution_engine.sql` | APPLIED: núcleo transacional, telefone, perdas, histórico e idempotência |
| `20260930132228_core_atomic_demo.sql` | APPLIED: provisionamento transacional da demo |
| `20260930134524_core_international_phone.sql` | APPLIED: preservação/validação do telefone internacional |
| `20260930162312_core_mutation_boundary.sql` | APPLIED: retirou escrita direta nas quatro entidades core; teste passou durante QA |
| `20260930163119_core_legacy_runtime_restore.sql` | APPLIED posteriormente: restaurou permissões mínimas necessárias ao runtime antigo de main |

**A fronteira RPC-only foi aplicada e testada, mas não está integralmente ativa no estado final.** A migration de compatibilidade mais recente prevalece. Não marque o requisito de imposição definitiva como concluído.

Grants atuais confirmados:

- `authenticated`: SELECT, INSERT e UPDATE em `contacts`, `opportunities`, `activities`.
- `authenticated`: SELECT e INSERT em `opportunity_history`.
- Sem DELETE/TRUNCATE/REFERENCES/TRIGGER nessas quatro tabelas; sem UPDATE no histórico.
- `anon`: sem acesso direto a essas tabelas.
- RLS mantida. Os RPCs continuam disponíveis aos papéis autorizados.

Não restaure ALL indiscriminadamente. Depois do QA final do novo runtime, crie **nova migration rastreada** para reativar a fronteira RPC-only. A reaplicação conceitual do SQL exige nova versão: não altere uma migration histórica já registrada.

Última contagem operacional confirmada: **2 empresas, 3 perfis, 0 contatos, 0 oportunidades, 0 atividades, 0 eventos de histórico, 0 receipts**. Fixtures transacionais foram revertidos; empresas de QA criadas nesta rodada foram removidas por ID/nome/dono conferidos. Empresas reais e Auth foram preservados. Esses números não descrevem o funil comercial da Aether Works e não devem ser usados como taxa de vendas.

## 5. O que já foi implementado no Prompt 1

### 5.1 Núcleo transacional

`POST /api/workspace` encaminha comandos para **`apply_workspace_command`**. O RPC confere usuário autenticado, vínculo com a empresa, parâmetros e referências antes de executar a mutação. Histórico e gravações necessárias ocorrem na mesma transação.

Comandos cobrem criação, edição, agendamento, reagendamento, conclusão, alteração de estágio, comentários e abertura do WhatsApp. Receipts em `workspace_commands`, chave por empresa/ator/request_id, protegem retries. Mesmo ID e payload retornam o resultado anterior; o mesmo ID com outro payload é rejeitado. Locks transacionais e constraint de telefone sustentam consistência.

Concluir exige próxima ação futura com tipo e data/hora ou encerramento ganho/perdido. Uma falha na criação da próxima ação reverte a conclusão anterior. Encerramento elimina pendências e limpa campos de próximo passo conforme testes.

Tipos previstos no requisito: WhatsApp, Ligação, Reunião, Enviar proposta, Revisar proposta, Aguardar cliente, Follow-up e Sem próximo passo/encerrar. Próxima ação futura exige tipo, data e hora; observação opcional. Encerrar exige escolha Ganho/Perdido; perdido exige motivo. Confrontar esses rótulos com a implementação antes de declarar equivalência funcional.

### 5.2 Perdas

Motivos controlados: Preço, Sem resposta, Escolheu concorrente, Adiado, Sem orçamento, Não qualificado, Sem prioridade, Outro. “Outro” exige explicação. `loss_reason`/`loss_note` e histórico estruturado preservam ator, horário e motivo.

### 5.3 Captura e telefone

Formulário compacto com cliente, telefone obrigatório, oportunidade, valor e próxima ação/data; detalhes secundários em “Mais detalhes”. Normalização preserva representação canônica +E.164 e valor normalizado para deduplicação. Aceita formatos brasileiros válidos, sem inventar DDD, e internacional explícito dentro das regras implementadas.

Primeira camada esperada: Nome do cliente*, WhatsApp/telefone*, Oportunidade*, Valor, Próxima ação e Data/hora. Segunda camada: Empresa, Origem, Descrição, Responsável, Estágio inicial e Observações. Exemplos de entrada a preservar nos testes: `71999999999`, `(71) 99999-9999` e `+55 71 99999-9999`; UI amigável, persistência normalizada, números claramente inválidos rejeitados.

Coluna gerada `contacts.phone_normalized` e índice único parcial `(company_id, phone_normalized)`. Um contato pode ter várias oportunidades. Duplicidade exige escolha explícita: abrir cliente, reutilizar para outra oportunidade ou cancelar. Dados antigos sem telefone continuam legíveis.

**Meta de 15–20 segundos ainda não medida.** Não afirmar ganho de velocidade quantificado.

### 5.4 WhatsApp operacional

Botões em Hoje, prioridades, lista, pipeline e detalhes. O componente reserva a abertura da aba, registra **`whatsapp_opened`**, então usa link oficial `wa.me`. Se o registro falha, fecha a aba reservada e informa erro.

Há texto pré-preenchido/cópia, sem envio automático. Evento significa somente abertura. `last_interaction_at` não é atualizado pela abertura do WhatsApp. Uma interação realizada depende de declaração explícita do usuário e resultado registrado.

O retorno opcional “Conseguiu falar?” não deve ser contado como validado apenas por existir um mecanismo alternativo de conclusão. Audite a experiência atual; implemente refinamento somente se necessário para o núcleo, sem automação externa.

### 5.5 Paradas, prioridades e histórico

`days_since_last_interaction` deriva de timestamp real; ausente significa desconhecido. Limiares centralizados: 0–2 dias normal, 3–6 atenção, 7+ parado. Abertura de WhatsApp, comentário, edição ou mudança de estágio não fabricam contato realizado.

Ordem determinística: vencida → hoje → sem próximo passo → parada 7+ → aguardando cliente → futura. Não usar IA. Indicadores e botões foram acrescentados sem criar outro status comercial concorrente.

Histórico registra criação, ações, conclusão/reagendamento, WhatsApp, estágio, ganho/perda e motivo com payload estruturado. Atualização/remoção não foi permitida nos testes sob authenticated.

### 5.6 UX e demo

Captura acessível, ação fixa no mobile, Escape/foco/teclado no formulário. Demo usa **`ensure_demo_workspace`**, transacional, idempotente e restrita ao dono; dados identificados como fictícios, sem números de WhatsApp inventados.

`/api/health` é liveness público. Não prova conexão com banco, integridade de schema ou autorização.

## 6. Arquivos e pontos de extensão existentes

| Área | Arquivos a ler antes de alterar |
|---|---|
| API operacional | `app/api/workspace/route.ts`, `app/api/health/route.ts` |
| Estado/telas | `app/workspace.tsx`, `app/dashboard.tsx`, `app/core-form.tsx` |
| WhatsApp/paradas | `app/whatsapp-action.tsx`, `app/stale-indicator.tsx` |
| UI global | `app/globals.css`, `app/layout.tsx` |
| Domínio | `lib/execution.ts`, `lib/request-origin.ts`, `lib/templates.ts` |
| Provisionamento | `lib/provision.ts`, `app/onboarding.tsx`, `app/api/onboarding/route.ts` |
| Auth/admin | `app/login/`, `app/admin/`, `app/api/admin/`, `app/auth/`, aliases `adm`/`entrar`/ativação existentes |
| Edge | `supabase/functions/create-access/index.ts` |
| Banco | `supabase/migrations/` e schema/policies reais |
| Testes | `tests/execution.test.ts`, `tests/request-origin.test.ts`, três arquivos SQL de aceitação |
| Evidências | `docs/qa/aether-flow-qa-20260930-1601.jpg`, docs de status/release |

Schema acrescentado: telefone normalizado, perdas, `opportunity_history.payload`, `workspace_commands` e funções de domínio/demo. FKs compostas de contato, estágio, responsável e atividade foram preservadas. Não adicionar uma segunda entidade para resolver a mesma responsabilidade.

Nenhuma Edge Function foi modificada nesta rodada. A função existente de criação de acesso foi lida; a segurança completa administrativa não foi declarada aprovada.

## 7. Testes e bugs: evidência disponível

### 7.1 PASS efetivamente observado

| Teste | Resultado | Limite da evidência |
|---|---|---|
| `npm test` | 11 PASS | 8 testes de domínio; 3 de origem HTTP |
| `npm run check` | PASS | TypeScript da aplicação; Edge Functions fora do tsconfig existente |
| `npm run build` | PASS | Build local de produção da revisão testada |
| `tests/core-acceptance.sql` | 23 PASS | PostgreSQL real; fixtures revertidos; rerodado após restauração de grants |
| `tests/demo-acceptance.sql` | 5 PASS | Demo transacional, fixtures revertidos; também passou sob RPC-only |
| `tests/core-mutation-boundary.sql` | PASS | Rodado com RPC-only ativo; não representa grants finais após restore |
| Desktop autenticado | PASS nos fluxos descritos abaixo | Sessão fornecida pelo usuário, QA fictícia separada |
| HTTP concorrente | PASS: 200 e 409, 1 contato/1 oportunidade | Intervalos HTTP sobrepostos; overlap interno de transações não comprovado |
| Jarvis: login em 360/390/412/768 | PASS de renderização/overflow/erros | Público; sem autenticação nem submissão de formulário |
| Railway QA e restore | SUCCESS | SHAs/IDs registrados; não equivale a merge |

Desktop: ausência/invalidade de telefone; criação; bloqueio de conclusão sem próximo passo; nova ação; telefone repetido com reutilização explícita; ganho/perda; motivo Outro com nota obrigatória; histórico; persistência após reload; Agendar da fila abrindo o formulário e salvando data/hora.

SQL core: inválido/válido/ausente, duplicidade/reutilização, idempotência/conflito, conclusão sem próximo passo rejeitada, rollback em erro da próxima ação, nova ação, ganho/perda, motivo obrigatório/Outro, auditoria WhatsApp sem contato falso, histórico append-only, leitura/RPC isolados, uniqueness por empresa e criação/persistência/duplicidade internacional.

Teste de grants: matriz de privilégios, EXECUTE do RPC, 12 tentativas diretas INSERT/UPDATE/DELETE negadas sob authenticated e quatro SELECTs negados sob anon. Depois desse teste, os grants de compatibilidade foram restaurados para main.

Concorrência HTTP observada em 15:57:33 UTC: uma requisição durou 919 ms/200; outra 1264 ms/409, intervalos sobrepostos. Banco permaneceu com um contato e uma oportunidade. Não transformar isso em prova de duas sessões PostgreSQL simultaneamente bloqueadas: o probe de bloqueio retornou zero.

WhatsApp: registro correto e `last_interaction_at` nulo comprovados. O protocolo nativo do aplicativo não pôde ser inspecionado pela ferramenta; não burlar restrição. Nenhuma mensagem foi enviada.

### 7.2 Bugs corrigidos na branch

1. Conclusão sem próximo passo.
2. Gravações operacionais separadas com risco de conclusão parcial.
3. Cadastro sem telefone/sem deduplicação.
4. WhatsApp sem auditoria de abertura.
5. Timestamps de contato atualizados por edição/comentário/estágio sem evidência.
6. Atraso ignorando horário do mesmo dia.
7. País internacional desaparecendo após normalização/persistência.
8. Rejeição de POST atrás do proxy Railway: origem pública é comparada estritamente com `RAILWAY_PUBLIC_DOMAIN`; regressões passaram. Não confiar arbitrariamente em forwarded headers.
9. Agendar na fila Hoje abrindo detalhes: agora abre agendamento diretamente; gravado e conferido.
10. Callback de WhatsApp na prioridade para renovar snapshot foi acrescentado. **Atualização visual desse callback ainda não foi testada separadamente.**

### 7.3 Pendências observadas

- Mobile autenticado dos fluxos core: NOT_TESTED.
- Medição de captura em 15–20 segundos: NOT_TESTED.
- Fronteira definitiva RPC-only: testada, porém desativada por restore compatível.
- Merge e release do Prompt 1: pendentes.
- Compensação de `create-access`/provisionamento: limpeza não confere todos os resultados; pode alegar ausência de estado parcial sem comprovação. Corrigir e testar.
- Advisor: proteção de senhas vazadas desabilitada; verificar disponibilidade e política antes de concluir.
- Avisos de SECURITY DEFINER: funções necessárias à transação, protegidas por auth/membership/search_path/grants; teste adversarial passou. Revisão final independente ainda pendente.
- Snapshot carrega todos os registros/histórico da empresa; performance/paginação não comprovadas com volume relevante.
- Auditoria integral RLS, administração, trial, importação, mobile e E2E final não concluída.

## 8. Jarvis: uso real, limites e continuidade segura

Jarvis foi usado, não apenas sugerido. Estado observado: worker **`local-heavy-v1`**, host **LORA**, release **`JARVIS-P0-MONTH1-RC51`**, heartbeat saudável. O kill switch global de efeitos permaneceu ligado.

Jobs concluídos:

| Job | Ação e resultado |
|---|---|
| `75029492-1d8b-4129-8104-a292ba762041` | `desktop.chrome.status`: sucesso; Chrome 153 observado; somente status/metadados |
| `e7b7be50-09df-4894-8b60-a5862f449b6f` | `web.browser.visual.audit`: login de main; quatro viewports; HTTP 200, sem overflow/erros observados |
| `d686308d-0416-4ca4-8c68-590bd735ae49` | Audit do login da branch e37, em 16:23:43 UTC: título Aether Flow · Próximo passo; mesmos quatro viewports, PASS |

Viewports: **360×800, 390×844, 412×915, 768×1024**. Esses resultados são verificações de renderização e erros/overflow, não certificação estética nem operação autenticada.

O canal de execução utilizou fila governada do worker via Supabase de gerenciamento autorizado, com vínculo/lease/allowlist verificados. Nenhuma chave de API foi lida/criada, nenhum kill switch foi desativado e nenhuma autoridade foi fabricada.

`web.browser.visual.audit` é público, sem bypass de autenticação ou submissão de formulários. `browser.operator.execute` e `computer.operator.execute` estavam planejados, não comprovados como disponíveis; sidecar desktop offline. Não pressupor que Jarvis já consegue operar todos os fluxos autenticados/mobile.

Não usar capacidade planejada como disponível. Não instalar capabilities, abrir CDP cru, habilitar efeitos ou modificar Jarvis para contornar a limitação deste MVP. Se um canal não puder concluir mobile autenticado, registre a dependência e use outro mecanismo suportado ou validação no dispositivo.

Documentos antigos de staging do Jarvis foram identificados como NÃO APLICADOS/NÃO EXECUTADOS. Não tratá-los como implementação instalada. Não duplicar jobs, não incluir URLs assinadas, tokens ou screenshots sensíveis em repositório público. A screenshot desktop já rastreada contém apenas QA fictícia.

## 9. Próxima ação obrigatória: finalizar Prompt 1

**Não iniciar Prompt 2 até estabilizar e liberar este núcleo.**

1. Reconferir HEAD/main, migrations, grants e configuração Railway.
2. Confirmar rollback disponível e compatibilidade do runtime antigo. Nunca restaurar runtime que dependa de permissões já revogadas sem migration de compatibilidade.
3. Colocar a revisão exata da branch em teste temporário na Railway, preservando domínio, variáveis e réplicas.
4. Testar autenticado em 360, 390, 412 e 768 px: login, criação compacta, validação, duplicidade/reutilização, detalhes, WhatsApp, concluir com próxima ação, ganhar/perder, horário, histórico, Hoje/prioridades e navegação. Testar teclado/foco/touch/overflow.
5. Conferir callback visual de atualização após WhatsApp. Medir captura com tarefa definida; não prometer 15–20 segundos sem medição.
6. Corrigir somente falhas que bloqueiam os critérios core; repetir checks impactados.
7. Com runtime transacional aprovado ativo, gerar nova migration pelo CLI e aplicar fronteira RPC-only. Sincronizar filename com versão realmente registrada.
8. Rodar boundary, core e demo SQL sob as permissões finais; fazer criação/agendamento autenticados e confirmar que bypass REST não grava. Fixtures isolados, sem contatos reais.
9. Revalidar build/TypeScript/runtime/health do HEAD exato. Revisar diff e proteger dados.
10. Somente após gates PASS, concluir revisão/merge, devolver fonte Railway para **main**, confirmar deployment **SUCCESS**, SHA correspondente e healthcheck.
11. Não deixar branch temporária em produção ao terminar uma rodada bloqueada. Restaurar permissões compatíveis antes do runtime antigo quando necessário, registrar motivo e estado exato.

DoD do Prompt 1: captura rápida funcional; telefone/duplicidade; WhatsApp auditado sem falsa mensagem; próximo passo obrigatório; motivo de perda; indicadores; histórico; mobile; RLS/grants; build/TypeScript/runtime/health; main e production SUCCESS. Medição não obtida deve continuar declarada, sem inventar precisão.

## 10. PROMPT 2 — DAILY WORK ENGINE: trabalho restante

**Estado:** não implementado como segundo sprint nesta rodada. Há funcionalidades parciais preexistentes; auditar e reaproveitar antes de contabilizar lacunas.

### A. Resolver pendências

Adicionar CTA em Hoje e workflow focado em uma oportunidade por vez. Exibir cliente, WhatsApp, empresa, oportunidade, valor, estágio, última interação/dias sem contato, próxima ação e atraso. Ações: WhatsApp, concluir, reagendar, aguardar cliente, editar, perder e ganhar.

Usar a prioridade determinística do Prompt 1. Após resolução persistida, carregar o próximo item e mostrar progresso (“3 de 11”). Não avançar como resolvido quando a operação falha ou nenhum estado necessário mudou. Abrir WhatsApp sozinho não resolve uma pendência.

### B. Aguardando cliente

Escolher a modelagem menos redundante: status operacional, flag controlada ou próxima ação. Registrar início e **revisão obrigatória**; não deixar indefinidamente aguardando. Reaproveitar action type existente se ele satisfizer a necessidade, sem duplicar status comercial.

### C. Pipeline configurável

Owner/admin da empresa pode renomear, adicionar, reordenar e excluir estágio vazio; tipos open/won/lost. Servidor e banco devem impor autoridade. Estágio com oportunidades exige migração explícita antes de exclusão. Evitar múltiplos terminais inconsistentes e posições duplicadas. Ordering transacional e teste de concorrência; botões subir/descer são aceitáveis se drag-and-drop aumentar risco.

### D. Tempo no estágio

Adicionar `stage_entered_at` ou usar histórico equivalente confiável. Atualizar junto à mudança de estágio e mostrar “Há 5 dias neste estágio”. Limiares centralizados e visíveis; não usar constantes escondidas.

### E. Contatos

Tela/rota Contatos com nome, telefone, empresa, quantidade de oportunidades, valor total, última interação/oportunidade e status claramente definido. Detalhe: dados pessoais, WhatsApp, todas as oportunidades e timeline agregada. Não fundir contato e oportunidade; não interpretar soma aberta como receita realizada.

### F. Busca global

Buscar cliente, empresa, telefone e oportunidade; normalizar telefone para busca formatada/sem formato. Isolamento de tenant no servidor/banco. Examinar performance antes de adicionar índices; evitar N+1.

### G. Timeline

Aproveitar payload/eventos já existentes. Apresentar horário/data e descrições úteis: created, edited, whatsapp_opened, stage_changed, activity_created/completed/rescheduled, comment_added, won, lost, loss_reason. Persistir estrutura, não apenas strings impossíveis de consultar. Agrupar Hoje/Ontem/data sem perder timestamp UTC.

### H. Origem

Padronizar WhatsApp, Instagram, Google, Site, Indicação, Ligação, Evento, Outro. Preservar dados antigos e opção Outro. Definir regra de migração sem adivinhar origem ausente.

### I. Empty states

Sem oportunidades: onboarding “Comece em 3 passos” — primeira oportunidade, próximo passo, Hoje — e CTA. Diferenciar sem pendências, pipeline vazio, busca vazia e sem contatos. Não confundir ausência de dados com falha de carregamento.

### J. Feedback

Componente discreto “Algo te atrapalhou?” Sim/Não; se Sim, “O que você tentou fazer?”. Persistir company_id, user_id, contexto, timestamp e mensagem em tabela apropriada. Não adicionar analytics invasivo. Validar tamanho e isolamento; preparar limitação de abuso.

### K. UX e aceitação

Escape fecha modal, Enter confirma quando adequado, Tab/foco/ARIA/touch corretos. Testar zero/20 itens, resolução sequencial e falha sem avanço, waiting/revisão, reorder concorrente, exclusão de estágio usado, contato com múltiplas oportunidades, busca por telefone nas duas formas, timeline, tenant isolation e mobile.

DoD: funcionalidades acima comprovadas, performance aceitável com cenário definido, RLS segura, build/TypeScript/runtime/health PASS e produção em main SUCCESS.

## 11. PROMPT 3 — BUSINESS OPERATIONS: trabalho restante

**Estado:** não implementado como terceiro sprint. Admin atual cria acesso; isso não equivale a console SaaS completo, reset, trial ou métricas aprovadas.

### A. Métricas operacionais e fórmulas

Implementar somente métricas necessárias aos primeiros clientes. Definir filtros, timezone, período e exclusões antes de construir:

| Métrica | Definição a formalizar e testar |
|---|---|
| Oportunidades abertas | Quantidade em estágios open no instante da consulta, conforme política de arquivamento |
| Valor aberto | Soma de valores das abertas; nulo não inventa valor |
| Ações vencidas | Pendentes com due_at anterior ao instante atual |
| Ações hoje | Pendentes na data local configurada; separar vencidas se categorias precisarem ser exclusivas |
| Sem próxima ação | Abertas sem próxima ação operacional válida |
| Paradas 7+ | Abertas com interação confirmada ≥7 dias; desconhecido separado |
| Ganhos/perdidos no mês | Encerradas no intervalo mensal definido por timestamp confiável de fechamento |
| Taxa de ganho | won / (won + lost), mesmo período; não incluir abertas; denominador zero deve mostrar ausência de base |
| Tempo médio até ganho | Média de closed_won_at − created_at nos ganhos do período; indicar unidade e amostra |
| Valor ganho no mês | Soma dos valores dos ganhos no período; não afirmar recebimento financeiro |

Definir política para reabertura/arquivamento; não misturar all-time com mês. Mostrar período. Origem das oportunidades e dos ganhos: contagens/somas factuais, sem score sofisticado.

### B. Importação CSV

Colunas: nome, telefone, empresa, oportunidade, valor, estágio, origem, próxima_acao, data_proxima_acao. Upload → parse → preview → mapeamento quando necessário → validação → erros → confirmação → execução → resumo.

Deduplicar contato por telefone dentro da empresa. Não confundir deduplicação de contato com ignorar uma segunda oportunidade legítima. Definir identidade/retry de importação para não duplicar oportunidades. Nunca sobrescrever sem regra explícita. Datas/fuso/BRL devem ter interpretação documentada; estágio desconhecido é erro ou escolha explícita, não invenção. Limite de arquivo/linhas razoável e explicado. Resumo: importados, atualizados, duplicados ignorados e erros, cada um com significado verificável. Rejeitar linhas inválidas visivelmente; estratégia de lote deve impedir sucesso parcial silencioso.

### C. Admin SaaS

Evoluir `/admin` aproveitando autorização atual controlada em `aether_admins`. Mostrar cliente, empresa, e-mail, criação, último login, abertas, última atividade e status. Ações: abrir ambiente, reset, bloquear/reativar, editar empresa e criar acesso.

Evitar impersonation irrestrito. Se houver suporte, acesso explícito, auditado, identidade visível e contexto diferenciado. Não confundir abrir ambiente autorizado com login silencioso como cliente.

### D. Bloqueio/reset

Estado de acesso no domínio; suspensão impede acesso segundo política definida, checado no servidor e nos caminhos de dados, não apenas na UI. Dados preservados; reativação disponível ao admin.

Reset por Auth Admin API server-side/Edge Function, política mínima de senha vigente, autorização controlada, auditoria sem senha e rate limit. Não manipular auth.users diretamente. A autorização anterior “se necessário troque a senha” não é motivo para resetar uma conta que já funciona; nenhuma senha foi alterada nesta rodada.

### E. Trial

Campos trial_started_at, trial_ends_at, subscription_status; estados trial, active, expired, suspended. Evitar sobrepor dois enums que possam se contradizer: documentar a fonte de verdade entre acesso e assinatura.

Mostrar término sem pressão artificial. Ao expirar, preservar dados e permitir leitura conforme política, bloqueando novas criações/alterações operacionais **em todos os caminhos de escrita**. Admin estende, ativa manualmente e suspende. Testar borda temporal e timezone. Sem Stripe nesta fase.

### F. Uso, feedback e export

Uso por cliente: último login, última atividade, oportunidades criadas, ações concluídas em 7 dias, dias ativos em 7 dias. Definir atividade válida e janela; sem scoring pseudo-inteligente.

Admin centraliza feedback com empresa, usuário, contexto, mensagem e data; estados open/reviewed/resolved. Export CSV de contatos e oportunidades, tenant-scoped, com tratamento seguro de células e recuperação dos dados sem lock-in.

### G. Aceitação

CSV válido/inválido/duplicado/100+ registros, retry sem duplicação, tenant isolation, suspensão/reativação, reset autorizado/não autorizado, trial ativo/expirado, admin-only, métricas vazias e win rate, export. Conferir servidor/RLS além de botões. DoD: checks, runtime, health e production SUCCESS com evidências.

## 12. PROMPT 4 — HARDENING E RELEASE FINAL: trabalho restante

Sprint predominantemente de auditoria, correção, simplificação, medição e documentação. Sem features grandes adicionais.

### A. Segurança e RLS

Inventariar **todas** as tabelas expostas, grants e policies para SELECT/INSERT/UPDATE/DELETE. Testar Tenant A/B tentando ler, modificar, excluir e referenciar IDs alheios. Incluir contato, estágio, responsável, atividade, histórico, receipts, feedback, imports, trial e admin conforme existirem. Segurança não se limita aos quatro objetos core.

Verificar `/admin`, Edge Functions, workspace, trial, reset e suporte. Fonte de admin controlada, nunca user_metadata. Funções SECURITY DEFINER devem ter search_path seguro, grants mínimos, validação explícita e escopo. Consolidar policies redundantes somente preservando semântica e retestando.

### B. Rate limiting e auditoria

Proteger criação de acesso, reset, importação, feedback e ações administrativas contra abuso trivial. Solução simples, com limite/janela e resposta recuperável; não infraestrutura desnecessária.

Auditar account_created, password_reset, account_suspended/reactivated, trial_extended, company_updated e support_access. Guardar ator, alvo, timestamp, evento e metadata segura; nunca senha/token. Garantir que o registro não permita encobrir falha da operação principal.

### C. Integridade, compensação e arquivamento

Conferir FKs/cascades, uniqueness, nullability, checks, órfãos e índices, especialmente telefone por empresa, ordering, memberships, atividades, oportunidades e histórico.

Corrigir compensação de criação de acesso: verificar cada resultado de cleanup e registrar recuperação se a compensação falhar. Testar falha após Auth, empresa, vínculo e etapas dependentes; não alegar “sem acesso parcial” sem comprovação. Nunca excluir acesso preexistente por confundi-lo com recurso recém-criado.

Avaliar archived_at para oportunidades/contatos quando necessário; não adicionar soft delete indiscriminadamente. Definir relação com export, busca, deduplicação, métricas e referências antes de aplicar.

### D. Performance e observabilidade

Examinar Hoje, lista, pipeline, Contatos e admin com volume representativo. EXPLAIN quando útil, identificar N+1/snapshot excessivo, adicionar índices por evidência. Banco sem dados não comprova performance nem justifica remover índice útil de FK.

Logs de erro com contexto suficiente, sem senha, token, secret, JWT completo ou dados pessoais desnecessários. Separar liveness e verificação de funcionamento real. Não chamar endpoint 200 de prova de saúde de tudo.

### E. Qualidade da interface

Skeletons quando úteis, evitando layout shift. Erros de rede/permissão/sessão/validação/servidor com ação possível. Undo somente para operações reversíveis como reagendamento/mudança simples de estágio, preservando consistência e histórico. Confirmar perda, arquivamento/suspensão e ações destrutivas; não pedir confirmação para tudo.

Revisar tipografia, espaçamento, ícones, cores, hover/focus, tabelas, pipeline, modais, vazio/sucesso e mobile. Identidade Aether Flow em title, favicon, login, sidebar, admin e demo; auditar ícones/arquivos existentes antes de substituir.

Brasil: BRL, DD/MM/YYYY, telefone BR, timezone central configurada (America/Bahia ou opção central validada); persistência UTC. Não converter UTC duas vezes. Hoje/Amanhã/Há X dias devem respeitar a zona definida.

Acessibilidade: labels/ARIA, contraste, teclado, foco de modal e alvos de toque. Mobile em 360, 390, 412, 768 e desktop: Hoje, fila, formulário, pipeline horizontal, detalhes, admin, login e importação. Captura pública do login não substitui essa matriz.

### F. Backup e recovery

Documentar onde estão código/banco, backups realmente disponíveis, restore, rollback de deployment, recuperação de migration e de usuário. Não afirmar backup configurado sem verificação. Não depender de conhecimento oral, secrets no documento ou down migration destrutiva.

### G. Advisors

Rodar security/performance advisors do Supabase. Classificar cada warning: corrigido, aceito conscientemente com motivo ou não aplicável com evidência. Retestar os corrigidos. Proteção de senhas vazadas e SECURITY DEFINER precisam de decisão explícita, não silêncio.

### H. E2E final

Admin: login → criar cliente → definir/gerar senha de acordo com modelo vigente → copiar acesso.

Cliente: login → criar oportunidade → abrir WhatsApp (somente abertura) → concluir → próximo passo → mover pipeline → aguardar com revisão → resolver fila → ganhar/perder → consultar contato → importar CSV → métricas → export.

Segurança: outro tenant tenta todos os IDs/rotas relevantes; deve falhar. Trial ativo funciona; expirado permite leitura conforme política e bloqueia escrita. Conta suspensa/reativada segue política server-side. Testar erro e recuperação, não apenas happy path.

## 13. Fora do escopo

Não implementar WhatsApp Cloud API, IA generativa, chatbot, e-mail marketing, telefonia, billing/Stripe completo, ERP/financeiro, app Android/iOS, automação multicanal, BI complexo ou integrações aleatórias. Não aumentar o Jarvis para compensar limitações de teste. Essas ideias aguardam evidência comercial.

Não baixar escopo de segurança para liberar mais features. Não adicionar dashboards antes de concluir a execução básica. Não construir produto para substituir validação comercial.

## 14. Método de execução e ordem de prioridade

Antes de alterar cada componente:

1. Ler implementação e dependências.
2. Confrontar schema, RLS/grants, funções, rotas e componentes existentes.
3. Identificar lacuna observada e critério de aceitação.
4. Trabalhar em branch específica, sem sobrescrever trabalho paralelo.
5. Preservar dados; migrations aditivas sempre que possível.
6. Implementar mínimo consistente; testar falhas/concorrência quando pertinentes.
7. Rodar TypeScript/build e testes relevantes.
8. Testar revisão exata na Railway temporariamente, com rollback conhecido.
9. Revisar e fazer merge somente após os gates.
10. Devolver Railway para main e conferir deployment final SUCCESS/SHA/health.

Severidade: **P0** impede acesso/uso/integridade; **P1** pode impedir decisão ou quebrar confiança; **P2** reduz experiência sem impedir operação básica; **P3** cosmético. Corrigir P0/P1 antes de estética.

Ordem atual: **fechar Prompt 1 → Prompt 2 → Prompt 3 → Prompt 4 → release final**. Não executar quatro blocos simultaneamente sem estabilização. A aprovação de cada sprint não substitui a auditoria final integrada.

Se um recurso estiver indisponível, registrar:

`MISSING / WHY / DEPENDENCY / NEXT_ACTION`.

Continue tarefas independentes, sem declarar o bloqueio resolvido e sem pedir novamente autorização já existente para trabalho reversível dentro do escopo. Não use tentativas repetidas num canal claramente bloqueado.

## 15. Comandos, migrations e critérios de release

Comandos existentes:

```bash
npm test
npm run check
npm run build
git diff --check
git status --short
```

Não inventar script de E2E que não existe. Use CLI/documentação dos serviços disponíveis e ferramentas suportadas. Os SQLs de aceitação devem ser lidos e executados no ambiente correto; eles possuem rollback de fixtures. O teste de boundary deve rodar **sob grants RPC-only**, não na configuração legacy final, onde seu FAIL seria esperado.

Para migrations: gerar via Supabase CLI; aplicar DDL pelo mecanismo de migrations; consultar histórico remoto e sincronizar filename/version reais. Não criar estado de “aplicado” apenas escrevendo arquivo. Não alterar migrations históricas para esconder diferenças.

Gates de cada publicação:

- branch revisada; git limpo; HEAD identificado;
- migrations sincronizadas e rollback/compatibilidade conhecidos;
- RLS/autorização/grants testados;
- build PASS; TypeScript PASS;
- runtime autenticado PASS; healthcheck PASS;
- testes de aceitação da etapa PASS;
- mobile necessário PASS;
- merge somente depois disso;
- Railway fonte main, deployment final SUCCESS, SHA correto.

Release final acrescenta advisors revisados, E2E completo, mobile total e recovery documentado. Nenhuma etapa pode substituir “não testado” por uma promessa.

## 16. Entrega final obrigatória ao terminar o MVP

Entregar relatório profissional com:

1. Funcionalidades implementadas e publicadas, separadas por sprint.
2. Arquivos modificados.
3. Migrations e versões realmente aplicadas.
4. Schema alterado.
5. RLS/grants/autorização alterados.
6. Edge Functions modificadas/publicadas.
7. Testes executados, cenários e revisão testada.
8. Evidências de PASS e limites.
9. Bugs encontrados.
10. Bugs corrigidos com verificação.
11. Limitações restantes e dependências.
12. Dívida técnica.
13. Funcionalidades propositalmente adiadas.
14. Estado exato do deployment final: branch, SHA, ID, status e healthcheck.
15. Riscos remanescentes antes de colocar clientes reais.

Manter um registro conciso do analisado para não repetir auditorias sem motivo. Atualizar docs existentes com o estado atual; preservar histórico útil sem deixá-lo contradizer a conclusão mais recente.

## 17. Primeiro checklist da próxima sessão

- [ ] Abrir PR #13 e confirmar HEAD/main.
- [ ] Ler status/release e migrations aplicadas.
- [ ] Conferir grants atuais: restore legacy é o estado final desta rodada.
- [ ] Confirmar rollback e preparar QA da revisão exata.
- [ ] Concluir mobile autenticado; conferir callback WhatsApp e captura.
- [ ] Ativar RPC-only em nova migration com runtime compatível; retestar.
- [ ] Fechar gates, merge e confirmar main/SUCCESS.
- [ ] Só então inventariar lacunas reais do Prompt 2.

**Regra de encerramento:** não diga “MVP terminado” enquanto qualquer gate obrigatório estiver NOT_TESTED, FAIL, BLOCKED ou apenas documentado. O estado atual é: **núcleo do Prompt 1 implementado e amplamente testado na branch; release definitivo pendente; Prompts 2–4 aguardam a sequência exigida.**
