# Aether Flow — estado da implementação em 30/09/2026

**O programa de quatro prompts não está concluído.** O núcleo do Prompt 1 foi implementado na branch `core-execution-20260930`, com PR #13 em rascunho. Os testes de código e banco abaixo passaram. O QA autenticado foi bloqueado pela resposta “E-mail ou senha inválidos”. A Railway voltou à versão de `main`, com deployment SUCCESS. Não houve merge.

Fonte canônica: https://github.com/murilosuporte5-rgb/aether-flow/pull/13.

## 1. Funcionalidades implementadas na branch

- Conclusão transacional de atividade com próxima ação obrigatória ou encerramento ganho/perdido.
- Motivos controlados de perda; “Outro” exige explicação; histórico registra ator, horário e payload.
- Criação compacta: cliente, telefone obrigatório, oportunidade, valor e próxima ação; campos secundários em “Mais detalhes”. A meta de 15–20 segundos ainda não foi medida.
- Normalização de telefone, representação canônica +E.164 e índice único por empresa/telefone. Dados antigos sem telefone continuam legíveis.
- Aviso de duplicidade, visualização do cliente e reutilização explícita para outra oportunidade.
- Comandos idempotentes: repetir o mesmo identificador/payload retorna a mesma oportunidade; reaproveitar o identificador com conteúdo diferente é rejeitado.
- Botões de WhatsApp em Hoje, prioridades, lista, pipeline e detalhes. Link oficial wa.me; evento whatsapp_opened; nenhuma afirmação de envio ou de contato realizado.
- Mensagem pré-preenchida e cópia de texto. Sem envio automático.
- Dias sem contato, limiares 3/7 dias e ordenação operacional determinística. Sem timestamp, o estado é desconhecido.
- Contato confirmado apenas por declaração explícita do usuário ao concluir a ação, com registro de resultado. Edição, comentário, mudança de estágio e abertura do WhatsApp não fabricam uma interação.
- Captura acessível no mobile, formulário com Escape/foco/teclado; validação visual em dispositivos ainda pendente.
- Demo provisionada em uma única transação, idempotente e sem inventar telefones para clientes fictícios.
- Endpoint público /api/health de liveness. Ele não mede a saúde do banco.

## 2. Arquivos modificados/adicionados

| Grupo | Arquivos |
|---|---|
| API | app/api/workspace/route.ts; app/api/health/route.ts |
| Interface | app/workspace.tsx; app/dashboard.tsx; app/core-form.tsx; app/whatsapp-action.tsx; app/stale-indicator.tsx; app/globals.css; app/layout.tsx |
| Domínio/provisionamento | lib/execution.ts; lib/provision.ts |
| Configuração | package.json; tsconfig.json; .gitignore |
| Testes | tests/execution.test.ts; tests/core-acceptance.sql; tests/demo-acceptance.sql |
| Migrações | três arquivos listados abaixo |
| Operação | docs/CORE_RELEASE.md; docs/IMPLEMENTATION_STATUS.md; docs/pending/core_mutation_boundary.sql |

A formatação expandiu arquivos que antes estavam comprimidos em poucas linhas. O PR contém a implementação e o procedimento de publicação/recuperação.

## 3. Migrações

| Versão/nome | Estado no banco |
|---|---|
| 20260930130958_core_execution_engine | APPLIED |
| 20260930132228_core_atomic_demo | APPLIED |
| 20260930134524_core_international_phone | APPLIED |

Os nomes/versões foram cruzados com supabase_migrations.schema_migrations. As dez migrações preexistentes também correspondem aos arquivos do repositório. Os acréscimos são compatíveis com o runtime antigo. Não houve remoção de dados de clientes.

**Ativação de permissões:** docs/pending/core_mutation_boundary.sql está preparado e NÃO APLICADO. Ficou fora da pasta de migrações para não ser executado antes do runtime transacional. Depois do QA, gerar uma nova migração pelo CLI, aplicar esse SQL e sincronizar a versão efetivamente registrada.

## 4. Schema alterado

- contacts.phone_normalized: coluna gerada pela normalização; índice único parcial (company_id, phone_normalized).
- opportunities.loss_reason e loss_note; check de motivos controlados.
- opportunity_history.payload: JSONB para eventos estruturados.
- workspace_commands: chave company_id/actor_id/request_id, comando, resultado e timestamp; suporte à idempotência.
- normalize_contact_phone, apply_workspace_command, ensure_demo_workspace e helper privado de histórico.
- FKs compostas já existentes para contato, estágio, responsável e atividade foram preservadas e conferidas.

## 5. RLS e autorização

- workspace_commands tem RLS; leitura exige ser o ator e membro da empresa. Sem escrita direta por authenticated/anon.
- RPC operacional valida auth.uid() e vínculo com a empresa antes de qualquer consulta/gravação; lookups e referências são restritos à empresa.
- RPC de demo restringe o ambiente ao dono autenticado da demo, com parâmetros limitados e lock transacional.
- Funções expostas têm search_path vazio; execução PUBLIC/anon revogada. Nenhum service_role foi adicionado ao cliente.
- Testes adversariais comprovaram leitura isolada das entidades core/receipts e rejeição de RPC/opportunity ID de outra empresa.
- O histórico não aceitou alteração/remoção nos testes sob authenticated.
- **Pendente:** retirar a escrita REST direta nas entidades operacionais após a implantação verificada. Até isso acontecer, a imposição do novo fluxo não deve ser considerada concluída contra todos os caminhos de acesso.
- Auditoria completa de todas as tabelas/verbos, trial/admin e futuras rotas pertence ao Prompt 4 e não está concluída.

## 6. Edge Functions

Nenhuma Edge Function foi modificada ou publicada. create-access foi lida na versão atual. Sua compensação não verifica os resultados da limpeza e pode afirmar que não deixou acesso parcial sem comprovação; correção e testes continuam pendentes.

## 7. Testes executados

| Verificação | Resultado | Limite |
|---|---|---|
| npm test | PASS — 8 testes de domínio | Sem UI autenticada |
| npm run check | PASS | TypeScript da aplicação; Edge Functions excluídas pelo tsconfig existente |
| npm run build | PASS | Build de produção local |
| tests/core-acceptance.sql | PASS — 23 verificações no PostgreSQL | Fixtures transacionais, rollback ao final |
| tests/demo-acceptance.sql | PASS — 5 verificações no PostgreSQL | Fixtures transacionais, rollback ao final |
| Runtime local /api/health e /login | HTTP 200 | Sem sessão autenticada |
| Deploy temporário dbcd9a0 | SUCCESS; health/login HTTP 200 | Anterior aos refinamentos finais de telefone/acessibilidade |
| Restore main f08f915 | SUCCESS; /login HTTP 200 | Versão anterior do produto |
| Login seguro | REJECTED — credenciais inválidas | Não há sessão autenticada confirmada |
| Mobile 360/390/412/768 | NOT_TESTED | Depende de login válido |
| Duas requisições simultâneas | NOT_TESTED | O conector SQL serializou as chamadas |

As verificações no PostgreSQL cobrem telefone ausente/inválido/válido, deduplicação/reutilização, idempotência, conclusão sem próximo passo rejeitada, falha após atualização da ação anterior com rollback, conclusão com nova ação, ganho/perda, motivo/Outro, histórico de WhatsApp sem falso contato, isolamento de empresas e telefone internacional.

## 8. Evidências de PASS

- Falha proposital no timestamp da próxima ação ocorreu depois da atualização da ação anterior: a atividade permaneceu pending e a quantidade de eventos não mudou.
- Repetir request_id com o mesmo comando devolveu o mesmo ID e não criou outra oportunidade; payload diferente foi rejeitado.
- O telefone internacional +1 415 555 2671 foi gravado como +14155552671, normalizado como 14155552671 e rejeitado como duplicado na segunda tentativa.
- Actor A não leu as entidades de B e não executou comandos em B; B também não leu entidades de A nem alterou o ID de A.
- Após rollback/limpeza dos fixtures: 3 perfis, 2 empresas, 0 contatos, 0 oportunidades, 0 atividades, 0 histórico e 0 receipts, como no baseline operacional.
- A consulta de deployments indicou SUCCESS e canRollback=true para os deployments de teste e restauração.

## 9. Bugs/problemas encontrados

1. Conclusão anterior permitia terminar sem próximo passo.
2. Criação/agendamento/conclusão anteriores usavam gravações separadas, sujeitas a estado parcial.
3. Cadastro anterior permitia ausência de telefone e não deduplicava.
4. Botões anteriores de WhatsApp não registravam abertura.
5. Edição/comentário/estágio atualizavam last_interaction_at sem comprovação de contato.
6. Deadline anterior ignorava a hora nos atrasos do mesmo dia.
7. Na primeira implementação, país internacional podia desaparecer após normalizar/gravar; teste de round-trip detectou o problema.
8. Compensação administrativa existente não conferia o sucesso da limpeza.
9. Leaked-password protection desabilitada, conforme advisor.

Itens 8/9 são pendências identificadas, não falhas de cliente observadas nem correções concluídas.

## 10. Bugs corrigidos

Itens 1–7 foram tratados na branch e nos testes descritos. Demo também passou a ter gravação atômica. Não foi alegada correção de todas as falhas do produto existente.

## 11. Limitações restantes / dependências

| MISSING | WHY | DEPENDENCY | NEXT_ACTION |
|---|---|---|---|
| QA autenticado do núcleo | Login rejeitado | Acesso válido pelo fluxo seguro | Autenticar; redeploy temporário da versão final da branch; testar |
| Mobile e acessibilidade visual | Sem ambiente autenticado | Sessão de QA | Testar larguras e navegação solicitadas |
| Concorrência verdadeira | Chamadas SQL sem sobreposição | Duas sessões HTTP autenticadas ou conexões independentes | Testar criação com mesmo telefone e mesma chave idempotente |
| Bloqueio de mutações diretas | Runtime antigo restaurado | Novo runtime aprovado | Aplicar SQL de ativação e testar bypass/RLS novamente |
| Merge/release do núcleo | Gates incompletos | PASS nos itens acima | Merge; fonte main; deployment final SUCCESS |
| Prompts 2, 3 e 4 | Sua regra proíbe avançar antes de estabilizar o Prompt 1 | Núcleo aprovado | Retomar auditoria do que já existe e implementar apenas lacunas |

## 12. Dívida técnica

- Snapshot carrega todos os registros/histórico da empresa; paginação/performance devem ser verificadas com volume real.
- Validar compensação administrativa, onboarding real, autorização/rate limits e reset no sprint correspondente.
- Definir política futura de retenção de receipts sem retirar a proteção de idempotência prematuramente.
- RLS de edição de pipeline deve corresponder a owner/admin quando a configuração for implementada.
- Advisors: dois WARN de SECURITY DEFINER aceitos intencionalmente para a fronteira transacional, com as proteções acima; revisão final independente pendente. Leaked-password protection continua pendente. Não foram removidos índices de FK/fluxo por não terem uso em um banco sem dados comerciais.

## 13. Funcionalidades adiadas

Prompts 2–4 continuam aguardando o gate do núcleo: fila Resolver Pendências, pipeline configurável, Contatos/busca global, feedback, métricas, CSV, admin/trial/reset/export e hardening/E2E completos. Funcionalidades preexistentes não foram contabilizadas como entregas novas.

WhatsApp Cloud API, IA/chatbot, Stripe completo, ERP, automação multicanal, app nativo e BI complexo seguem fora do escopo, conforme sua instrução.

## 14. Deployment exato

| Uso | ID | Commit/fonte | Estado confirmado |
|---|---|---|---|
| Teste temporário | 4d08f1ab-594b-4ff0-8e3e-99fe6906fd32 | dbcd9a0abca7097326e00854348661c7b2a52c19 / core-execution-20260930 | SUCCESS; substituído pela restauração |
| Produção atual restaurada | 63e8783f-5832-4cb3-a5f1-1562dc7907d0 | f08f9157fc0786afd2b0d20529f1e260d87f38a5 / main | SUCCESS |

Configuração de produção conferida: main, commit f08f915, healthcheck /login, timeout 30s. Domínio, variáveis, réplicas e dados de clientes preservados. **Os novos recursos ainda não foram incorporados a main.**

## 15. Riscos antes de operar clientes reais

- Não declarar o núcleo aprovado sem QA autenticado, mobile, concorrência real e ativação da fronteira de escrita.
- Não operar criação de acessos sem revisar a compensação e recuperação administrativa.
- Não considerar os avisos de Auth/advisors resolvidos apenas por registrar uma justificativa.
- Não vender trial, CSV, reset, fila ou métricas como implementados neste trabalho.
- Para continuar, é necessário um login válido pelo formulário seguro; não enviar senha/token pela conversa. O restante do código e os testes estão preservados no PR.
