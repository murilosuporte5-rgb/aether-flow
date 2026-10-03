# AETHER FLOW — SOMENTE O QUE AINDA FALTA

O Aether já recebeu muitas melhorias. Antes de implementar qualquer item abaixo, confira o estado atual do `main` para não repetir trabalho.

Não refaça funcionalidades que já existem. Trabalhe apenas nas pendências abaixo, em etapas pequenas.

Quando uma decisão importante envolver UX, animação, psicologia, conversão, tipografia ou comportamento, pesquise referências atuais e evidência em HCI/design systems antes de escolher a solução.

## 1. Fechar o fluxo do Capture

O Capture básico, deduplicação, reutilização de contato, captura manual/mobile e registro rápido de resultado já existem.

Agora falta transformar:

**capturar → resultado → próxima ação**

em um fluxo único.

Faça:
- depois de “Respondeu”, “Não respondeu”, “Pediu retorno”, “Proposta enviada” ou “Vai decidir”, sugerir imediatamente o próximo passo;
- oferecer opções rápidas como Hoje, Amanhã, próximo dia útil e escolher data;
- permitir confirmar sem precisar abrir outra tela;
- ao terminar, mostrar claramente que o lead está acompanhado;
- manter opção de abrir a oportunidade se o usuário quiser editar mais detalhes.

Por quê:
o Capture só fica realmente valioso quando o usuário termina a conversa e o Aether já sabe o que deve acontecer depois.

## 2. Refinar a fila “Resolver pendências”

A fila, progresso e avanço para o próximo item já existem.

Não recrie isso.

Melhore o que existe:
- deixar a experiência mais parecida com um modo de foco;
- mostrar uma oportunidade por vez com contexto essencial;
- facilitar WhatsApp → resultado → próxima ação → próximo item;
- preservar o progresso se houver refresh ou saída acidental, quando isso puder ser feito de forma simples e segura;
- no fim, mostrar um resumo curto do que foi resolvido;
- permitir sair a qualquer momento.

Evidência:
pesquisa sobre flow favorece objetivo claro, feedback imediato e continuidade da tarefa.

## 3. Remover a fricção restante do login

Ainda existe aceite obrigatório de Termos/Privacidade em todo login.

Melhore:
- registrar a versão aceita;
- pedir novo aceite apenas quando necessário;
- se o usuário já estiver autenticado e abrir `/login`, levar direto ao produto;
- preservar o comportamento seguro atual de autenticação.

Não adicione novas telas de login sem necessidade.

## 4. Feedback instantâneo e Undo

Hoje várias ações ainda esperam servidor + reload do snapshot antes de parecer concluídas.

Melhore primeiro as ações frequentes e reversíveis:
- mudança de estágio;
- reagendamento;
- conclusão de ação;
- pequenas alterações seguras.

Faça:
- feedback visual imediato;
- mensagem específica, por exemplo “Movido para Proposta” em vez de apenas “Alteração salva”;
- Undo quando a operação for realmente reversível e segura;
- reverter a interface corretamente em caso de erro.

Não transforme ações críticas em optimistic update sem proteção.

## 5. Skeletons e percepção de carregamento

O app já tem loaders e animações, mas ainda não possui um sistema consistente de skeletons.

Crie skeletons para as áreas em que há espera perceptível:
- Hoje/Radar;
- cards de oportunidade;
- listas principais;
- painéis relevantes.

O skeleton deve imitar a geometria real da interface para reduzir layout shift.

Evidência:
feedback visual durante espera reduz incerteza; estudos sobre percepção de espera mostram que timing e movimento precisam ser calibrados, não simplesmente acelerados.

## 6. Organizar o motion system existente

O app já possui várias animações, transições e `prefers-reduced-motion`.

Não adicione animação em tudo.

Agora:
- padronize durations e easings;
- crie poucos tokens reutilizáveis de motion;
- use tempos curtos para hover/press;
- use tempos um pouco maiores para modal/drawer/reordenação;
- deixe animação expressiva apenas para momentos realmente importantes;
- preserve reduced motion;
- procure animações duplicadas ou inconsistentes e simplifique.

Use como referência Atlassian Motion, Microsoft Fluent e IBM Carbon.

## 7. Melhorar o encerramento de uma sessão de trabalho

A fila já mostra progresso e “Fila concluída”.

Melhore o fim:
- mostrar quantidade de retornos resolvidos;
- quantidade de próximas ações criadas;
- valor acompanhado, somente quando os dados permitirem afirmar isso corretamente;
- usar uma microcelebração discreta e rara;
- não inventar pontuação, XP ou recompensa artificial.

Evidência:
Progress Principle e goal-gradient favorecem progresso real e pequenas vitórias perceptíveis.

## 8. Next Best Action explicável

Ainda não existe uma camada clara de Next Best Action.

Comece simples e determinístico antes de usar IA complexa.

Exemplos:
- proposta enviada + vários dias sem interação + sem próxima ação → sugerir follow-up;
- aguardando cliente além do período esperado → sugerir revisão;
- oportunidade sem responsável → sugerir atribuição;
- oportunidade sem próximo passo → sugerir definição.

Sempre mostrar:
- a sugestão;
- o motivo;
- botão para aceitar, alterar ou ignorar.

Não usar score mágico.

## 9. Momentum explicável

Ainda não existe Momentum.

Adicionar de forma simples:
- Esquentando;
- Estável;
- Esfriando.

Basear apenas em sinais disponíveis e explicáveis:
- recência de interação;
- próxima ação;
- atraso;
- avanço de etapa;
- tempo parado.

Sempre permitir ver “Por que?”.

Não inventar precisão ou probabilidade de fechamento.

## 10. Briefing antes do WhatsApp

Antes de abrir o WhatsApp, quando houver contexto suficiente, mostrar de forma compacta:
- cliente;
- valor;
- etapa;
- última interação;
- objeção/contexto comercial;
- combinado anterior;
- próxima ação.

Objetivo:
o vendedor não precisar reconstruir mentalmente a conversa.

Não criar uma tela pesada. Deve ser rápido de ignorar ou abrir.

## 11. Extração estruturada com confirmação

Quando houver texto/anotação como:

“vou falar com meu sócio e respondo sexta”

o Aether pode sugerir:
- aguardando decisão;
- retorno sexta;
- decisor adicional/contexto;
- observação.

Mas:
- nunca alterar campos importantes silenciosamente;
- mostrar o que será alterado;
- usuário confirma ou corrige.

## 12. Tipografia e performance de fontes

O projeto ainda usa Google Fonts por `@import`.

Avalie migrar DM Sans/Manrope para `next/font` ou equivalente self-hosted do Next, preservando a aparência se ela já estiver boa.

Objetivo:
- reduzir dependência externa;
- melhorar estabilidade visual;
- evitar layout shift;
- manter legibilidade de dashboard, números e tabelas.

Não troque a identidade tipográfica sem motivo.

## 13. Segurança que ainda falta revisar

Já existem headers básicos de segurança e rate limiting em partes do sistema.

Não repita isso.

Agora revise apenas lacunas reais:
- avaliar CSP compatível com Next/Supabase e testar antes de endurecer;
- tratar o cooldown em `localStorage` apenas como UX, não como defesa real;
- verificar rate limiting server-side dos pontos realmente sensíveis;
- revisar permissões da extensão e remover qualquer permissão não usada;
- revisar exposição desnecessária de PII.

Não quebrar Capture, autenticação ou integrações em nome de hardening.

## 14. Performance mensurável

Adicionar/usar medição para:
- INP;
- LCP;
- CLS;
- tempo das ações críticas.

Só otimizar onde houver evidência de gargalo.

Também:
- garantir que animações usem propriedades baratas quando possível;
- evitar animação fora de viewport;
- revisar imagens grandes;
- observar o tamanho do bundle antes de adicionar dependências.

## 15. QA visual final — sem redesign

A landing e o app já receberam bastante trabalho visual.

Não redesenhe.

Faça apenas uma revisão de qualidade em:
- 360 px;
- 390 px;
- 768 px;
- 1024 px;
- 1366 px;
- 1440 px ou maior.

Corrigir somente problemas concretos:
- overflow;
- modal cortado;
- botão difícil de tocar;
- sidebar/menu desproporcional;
- card comprimido;
- espaço vazio estranho;
- screenshot deformado;
- título exagerado;
- quebra de grid;
- texto pouco legível.

## 16. Padronizar detalhes técnicos pequenos

Revise pequenas inconsistências que diminuem a sensação de produto maduro:
- timezone usado pelo app;
- mensagens genéricas de sucesso;
- nomes de ações;
- labels duplicadas;
- estados vazios;
- feedback de erro;
- comportamento depois de refresh.

Exemplo atual a revisar:
há uso misto de `America/Sao_Paulo` e `America/Bahia`. Escolha uma estratégia consistente para datas do produto.

## Ordem sugerida

Faça nesta ordem:

1. Capture → resultado → próxima ação;
2. Focus/Resolver pendências;
3. login sem aceite repetitivo;
4. feedback instantâneo + Undo;
5. skeletons + motion system;
6. encerramento satisfatório da sessão;
7. Next Best Action;
8. Momentum;
9. briefing WhatsApp;
10. extração estruturada;
11. fontes/performance;
12. segurança restante;
13. métricas de performance;
14. QA visual final;
15. pequenos detalhes técnicos.

Em cada etapa:

1. confira se já não foi implementada;
2. pesquise quando houver decisão de UX relevante;
3. implemente uma mudança pequena;
4. teste;
5. confira mobile e desktop quando houver impacto visual;
6. corrija;
7. faça commit;
8. siga.

## Objetivo

**Não adicionar funcionalidades por quantidade. Fazer o fluxo atual do Aether exigir menos pensamento e menos cliques, responder mais rápido e aproveitar melhor os dados que ele já possui.**

O usuário deve sentir:

**“Joguei a oportunidade no Aether, fiz o contato, registrei o resultado em segundos e o sistema já deixou claro o que acontece depois.”**
