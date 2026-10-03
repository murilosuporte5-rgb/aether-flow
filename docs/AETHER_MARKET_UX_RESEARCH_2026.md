# AETHER FLOW — MARKET / UX / MOTION / PSYCHOLOGY RESEARCH 2026

Data da revisão: 03/10/2026

## Objetivo

Este documento transforma pesquisa de mercado, HCI, psicologia comportamental, design systems e padrões atuais de SaaS em melhorias pequenas, testáveis e incrementais para o Aether Flow.

A meta NÃO é refazer o produto nem substituir a landing page atual.

A meta é fazer o produto atual parecer e funcionar como um software mais maduro, rápido, seguro, claro, prazeroso e moderno, com menos trabalho manual e mais percepção de valor.

### Fora deste roadmap

Não incluir neste ciclo:
- MCP do Aether;
- MFA;
- passkeys;
- redesign completo da landing;
- sincronização total do WhatsApp;
- chatbot autônomo;
- disparo automático de mensagens;
- animação decorativa sem função;
- dark patterns;
- urgência, escassez, prova social ou números inventados.

## Método da pesquisa

Foram comparados padrões de pelo menos 24 produtos/sistemas maduros ou relevantes:

1. HubSpot
2. Pipedrive
3. Attio
4. Salesforce
5. Linear
6. Notion
7. Slack
8. Asana
9. Duolingo
10. Canva
11. Framer
12. Webflow
13. Figma
14. Vercel — somente como referência de interface/design, não infraestrutura
15. Stripe
16. Shopify / Polaris
17. Intercom
18. ClickUp
19. monday.com
20. Apple
21. Microsoft Fluent
22. Superhuman
23. Atlassian Design System
24. IBM Carbon Design System

Também foram consultados trabalhos acadêmicos sobre:
- velocidade de animação e percepção de espera;
- microinterações;
- processamento fluente e aesthetic-usability effect;
- saliência visual e atenção;
- goal-gradient;
- feedback imediato e controle;
- peak-end rule;
- acessibilidade, tamanho de alvos e redução de movimento.

---

# 1. O que o mercado está ensinando

## HubSpot
Direção observada: CRM autoatualizável, menos entrada manual, contexto capturado conforme a equipe trabalha, sugestões de atualização, follow-up e próximo passo.

Lição para o Aether:
- o usuário não deve trabalhar para manter o CRM atualizado;
- Capture + sugestões + Radar são mais estratégicos que adicionar formulários;
- contexto deve entrar no sistema com o mínimo de esforço.

## Pipedrive
Direção observada: insights contextuais, resumo de negócios, recomendação de próximas ações, probabilidade, gargalos e atividade/inatividade.

Lição:
- mostrar o próximo melhor movimento;
- explicar por que a oportunidade merece atenção;
- resumir antes do usuário abrir WhatsApp.

## Attio
Direção observada: atributos enriquecidos, recência/frequência de interação, força de conexão e contexto calculado automaticamente.

Lição:
- transformar tempo e frequência em sinais visuais simples;
- “há 4 dias sem resposta” é melhor que uma data isolada;
- Momentum deve ser explicável, não um score mágico.

## Salesforce
Direção observada: redução de poluição, visual mais atual, superfícies e formas mais amigáveis.

Lição:
- reduzir densidade errada, não necessariamente quantidade de informação;
- melhorar agrupamento, hierarquia e profundidade.

## Linear
Direção observada: fluxo extremamente rápido, teclado, command menu, busca, seleção, side panels e navegação sem perder contexto.

Lição:
- usuários frequentes devem ficar cada vez mais rápidos;
- Command Palette, atalhos e Quick Peek podem tornar o Aether “rápido de verdade”.

## Notion
Direção observada: atalhos fáceis de descobrir, Cmd/Ctrl+K, slash commands e navegação contextual.

Lição:
- não obrigar o usuário a memorizar atalhos;
- mostrar o shortcut no tooltip/menu e ensinar gradualmente.

## Slack
Direção observada: teclado, undo, feedback, preferências de animação e layout simplificado.

Lição:
- poder desfazer aumenta sensação de controle;
- respeitar reduced motion;
- preferir previsibilidade a efeitos chamativos.

## Asana
Direção observada: celebrações opcionais em conclusões relevantes.

Lição:
- delight funciona melhor quando é raro;
- não celebrar salvar campo;
- celebrar momentos de fechamento, fila zerada ou marco real.

## Duolingo
Direção observada: progresso visível, milestones, continuidade e forte tratamento do momento de conquista.

Lição:
- progresso verdadeiro aumenta motivação;
- Aether pode mostrar “7 de 10 prioridades resolvidas hoje”;
- nunca criar progresso artificial.

## Canva
Direção observada: interações fáceis de entender, movimento que traz conteúdo à vida e foco em reduzir curva de aprendizado.

Lição:
- movimento deve ser legível por quem não é especialista;
- primeira experiência precisa parecer simples.

## Framer
Direção observada: hover, press, appear, scroll e page transitions tratados como sistema; testar breakpoints; movimento não pode atrasar leitura.

Lição:
- landing pode ganhar vida sem ser reconstruída;
- animações devem reforçar hierarquia e continuidade.

## Webflow
Direção observada: microinterações como feedback e orientação; recomenda contenção para evitar caos e perda de performance.

Lição:
- cada animação deve responder “qual informação ela comunica?”;
- se a resposta for “nenhuma”, provavelmente remover.

## Figma
Direção observada: motion entrando no próprio design system; movimento deixa de ser efeito isolado e vira linguagem reutilizável.

Lição:
- criar tokens de motion do Aether, não tempos aleatórios em cada componente.

## Vercel — referência de interface
Direção observada: transform/opacity, reduced motion, movimento interruptível e causa/efeito.

Lição:
- performance faz parte da estética;
- evitar animações de layout custosas.

## Stripe
Direção observada: consistência visual, passos claros, personalização/contexto e sensação de segurança em ações sensíveis.

Lição:
- confiança vem também da previsibilidade;
- exportação, login, importação e ações destrutivas precisam parecer controladas.

## Shopify / Polaris
Direção observada: design system para manter consistência de componentes, acessibilidade e performance em grande escala.

Lição:
- tokens e padrões do Aether evitam “cada tela com uma cara”.

## Intercom
Direção observada: onboarding contextual, pointers curtos, valor antes da instrução, 4–5 passos quando necessário e celebração opcional no final.

Lição:
- não criar tour gigante;
- ensinar no momento em que a função aparece;
- permitir ignorar/adiar;
- first value antes de documentação.

## ClickUp
Direção observada: command center, atalhos e automação/contexto para reduzir navegação manual.

Lição:
- ações frequentes devem estar a uma busca/tecla de distância.

## monday.com
Direção observada: blocos de trigger/condition/action e forte foco em orientação e templates.

Lição:
- onboarding por objetivo é melhor que “conheça todas as abas”.

## Apple
Direção observada: movimento breve, preciso, cancelável, funcional e acessível; áudio e animação devem apoiar feedback.

Lição:
- “satisfatório” não significa exagerado;
- precisão gera sensação premium.

## Microsoft Fluent
Direção observada: motion funcional, natural, consistente e appealing; hierarquia de animação direciona atenção.

Lição:
- uma tela deve ter um foco animado principal, não vários objetos disputando atenção.

## Superhuman
Direção observada: velocidade percebida e real como parte da marca, Command, shortcuts, undo e momentos raros de delight.

Lição:
- rapidez pode ser uma característica emocional do produto;
- não basta responder rápido: a interface precisa parecer imediata.

## Atlassian Design System
Direção observada: motion formalizado por duração, easing e propriedade. Interações frequentes ficam muito curtas; elementos maiores recebem um pouco mais de tempo.

Lição:
- motion precisa de escala consistente.

## IBM Carbon
Direção observada: separação entre productive motion e expressive motion.

Lição:
- quase tudo no CRM deve usar productive motion;
- expressive motion fica reservado para momentos de conquista ou onboarding.

---

# 2. Evidência científica que realmente muda decisões

## 2.1 Velocidade de loading não deve ser “o mais rápido possível”

Ding & Kyung, Journal of Consumer Research, publicado em 2025 e volume 2026, encontraram uma relação convexa entre velocidade de animação repetitiva de loading e espera percebida: velocidades moderadas produziram menor espera percebida do que ausência de animação, movimento lento ou movimento rápido demais em seus experimentos. Também observaram efeitos em métricas como click-to-landing, conversão e avaliação de produto em contextos experimentais.

Aplicação:
- NÃO copiar números do estudo diretamente para todas as animações;
- o estudo trata principalmente espera incidental/repeated loading;
- testar spinners/loaders/skeleton activity do Aether em velocidade moderada;
- hover/press continuam precisando ser muito rápidos.

## 2.2 Microinteração funciona quando aumenta facilidade, prazer e controle

Estudo de Ma, Xie & Chen (International Journal of Human–Computer Interaction, 2024) encontrou relação entre facilidade percebida, experiência hedônica, prazer/controle e intenção de uso em microinterações.

Aplicação:
- confirmação clara;
- microanimação que explica resultado;
- sensação de controle;
- familiaridade e consistência;
- não fazer motion imprevisível.

## 2.3 “Bonito parece fácil” é parcialmente “fácil de processar”

Trabalho CHI 2023 sobre processing fluency encontrou forte relação entre estética e usabilidade percebida, mas essa relação cai bastante quando se controla fluência de processamento.

Aplicação:
- o objetivo não é enfeitar;
- clareza visual, agrupamento, legibilidade e previsibilidade podem ser a origem de parte da sensação “premium”.

## 2.4 Saliência visual realmente direciona atenção

Pesquisa em HCI mostra que informação relevante mais saliente tende a ser encontrada mais rapidamente; pouca saliência pode aumentar distração.

Aplicação:
- apenas UM CTA principal por contexto;
- urgência relevante deve se destacar;
- não transformar todos os cards em “importantes”.

## 2.5 Goal-gradient

Pesquisa clássica em Journal of Marketing Research mostrou aumento de esforço/persistência à medida que pessoas se aproximam de uma meta.

Aplicação ética:
- mostrar progresso REAL: “8/11 prioridades resolvidas”;
- onboarding real: “2/3 passos essenciais concluídos”;
- não criar progresso falso para manipular.

## 2.6 Peak-end

Pesquisa aplicada a UX de apps encontrou relação entre episódios marcantes/finais e satisfação geral, mas não sustenta que o peak/end explique tudo de forma dominante.

Aplicação:
- tratar como hipótese de design, não lei universal;
- caprichar em fechamento ganho, fila zerada, importação concluída e primeiro valor percebido;
- medir.

## 2.7 Feedback imediato e controle

Literatura de HCI associa feedback imediato, previsibilidade, undo e recuperação a maior confiança e controle.

Aplicação:
- feedback visual deve começar no mesmo instante do clique;
- backend pode confirmar depois;
- erros precisam ter saída clara;
- ações reversíveis devem oferecer Undo quando seguro.

---

# 3. Gatilhos psicológicos e visuais — versão ética para o Aether

## 3.1 Saliência
Objetivo: fazer o olho encontrar a ação certa primeiro.

Aplicar:
- CTA primário único;
- prioridade número 1 com contraste maior;
- highlight dinâmico apenas uma vez ao entrar;
- reduzir contraste do secundário.

Evitar:
- cinco cores de urgência;
- pulsos infinitos;
- vários botões primários.

## 3.2 Processamento fluente
Objetivo: fazer o sistema parecer simples porque é fácil de ler e prever.

Aplicar:
- line-height consistente;
- títulos curtos;
- grupos claros;
- padrões repetidos;
- ações sempre no mesmo lugar.

## 3.3 Goal-gradient
Objetivo: reforçar vontade de concluir uma fila real.

Aplicar:
- “7 de 10 prioridades resolvidas hoje”;
- barra discreta;
- mudança de estado conforme aproxima da conclusão.

## 3.4 Aversão à perda — somente com fatos
Objetivo: mostrar custo de inação sem medo artificial.

Aplicar:
- “R$ 18.400 em propostas sem retorno” apenas se calculado de dados reais;
- “4 oportunidades estão esfriando” apenas por regra explicável;
- sempre colocar a ação de recuperação ao lado.

Evitar:
- “você está perdendo dinheiro” sem evidência;
- vermelho em tudo.

## 3.5 Controle e reversibilidade
Objetivo: diminuir ansiedade de clicar.

Aplicar:
- Undo;
- prévia antes de ação destrutiva;
- “Salvo” e “Desfeito” claros;
- operações automáticas sempre explicáveis.

## 3.6 Familiaridade
Objetivo: o usuário aprender o sistema sem perceber.

Aplicar:
- mesma duração para a mesma classe de ação;
- mesma localização de feedback;
- mesmos estados de cor e motion.

## 3.7 Prova social
Somente quando houver prova real.

Aplicar:
- depoimento real;
- quantidade real;
- caso real;
- screenshot real.

Enquanto não houver:
- usar prova do produto: telas reais, fluxo real, dados demo claramente marcados.

## 3.8 Compromisso pequeno
Objetivo: reduzir fricção do primeiro passo.

Aplicar:
- “Adicionar 1 contato”;
- “Abrir demo”;
- “Resolver primeira prioridade”.

Não pedir configuração extensa antes de mostrar valor.

## 3.9 Progresso percebido
Mostrar que a ação do usuário teve consequência:
- card sai da fila;
- contador diminui;
- histórico recebe item;
- próxima ação aparece;
- status de salvamento.

## 3.10 Peak/end
Criar bons finais:
- primeira captura concluída;
- primeira oportunidade ganha;
- fila de hoje zerada;
- importação concluída sem erro.

Esses momentos podem usar expressive motion; o resto não.

---

# 4. Motion System proposto

Valores abaixo são baseline para teste, não dogma.

Inspirado por Atlassian, Fluent, Carbon, Apple e padrões de SaaS maduros.

## Motion tokens

- instant: 0–80 ms — resposta visual mínima/press;
- fast: 80–150 ms — hover, focus, chip, toggle, botão;
- standard: 160–240 ms — dropdown, toast, small panel, state change;
- spatial: 220–320 ms — modal, drawer, detalhe;
- expressive: 320–500 ms — raros momentos de conquista;
- nunca alongar ação frequente só para mostrar animação.

## Easing

- enter: ease-out;
- exit: ease-in e geralmente um pouco mais curto;
- mudança de posição/container: ease-in-out;
- loading circular: linear;
- spring apenas em elementos pequenos e raros, sem bounce infantil.

## Regras

1. Uma animação focal por região de viewport.
2. Não animar width/height/top/left quando transform/opacity resolver.
3. Motion precisa ser interruptível.
4. Estado final deve existir mesmo com prefers-reduced-motion.
5. Não depender apenas de movimento ou cor para comunicar.
6. Não repetir animação expressiva toda vez que usuário visitar.
7. Nada piscando para chamar atenção.
8. Não usar parallax forte no mobile.
9. Não deixar scroll preso em “storytelling”.
10. Medir INP/CLS depois de cada conjunto de motion.

---

# 5. Biblioteca de microcoisas para APP

## Botões
- hover de fundo/contraste em 80–120 ms;
- press com compressão visual mínima, sem layout shift;
- disabled claramente diferente;
- loading mantém largura do botão;
- sucesso pode trocar ícone para check por curto período;
- nunca mover o botão depois do clique.

## Cards
- hover só em cards clicáveis;
- elevação muito pequena;
- prioridade atual pode receber highlight de entrada UMA vez;
- card resolvido sai/reordena suavemente;
- não fazer todos “flutuarem”.

## Tabelas/listas
- hover de linha sutil;
- keyboard focus visível;
- Quick Peek sem perder posição;
- item atualizado recebe flash suave de background;
- reordenação espacial explica para onde o item foi.

## Modais/drawers
- backdrop aparece antes/ao mesmo tempo;
- modal entra com opacity + pequena escala;
- saída ligeiramente mais rápida;
- foco vai ao modal;
- Esc fecha quando seguro;
- ao fechar, foco volta ao elemento de origem.

## Dropdown/popover
- nascer visualmente perto do trigger;
- 100–160 ms;
- sem zoom exagerado;
- hover item imediato;
- teclado completo.

## Toast/feedback
- “Salvo”;
- “Próxima ação criada”;
- “Movido para Proposta”;
- “Desfeito”;
- toast não deve bloquear fluxo;
- ação Undo quando possível.

## Tempo humano
Priorizar:
- “há 4 dias”;
- “vence em 2h”;
- “hoje às 15:00”;
- data absoluta em texto secundário/tooltip.

## Urgência
- vencido: cor semântica + ícone + duração;
- hoje: sinal diferente de vencido;
- aguardando cliente: tom próprio + “aguardando há X dias”;
- sem próxima ação: linguagem clara;
- não usar animação contínua em vermelho.

## Número e mudança
Quando contador muda:
- animar apenas o dígito/valor alterado;
- não reanimar dashboard inteiro.

## Estado vazio
Nunca apenas “Nada aqui”.

Exemplo:
“Tudo resolvido por hoje.”
Subtexto: “A próxima ação está marcada para amanhã.”
Momento de calma, não uma tela morta.

## Som
Somente opt-in e raro:
- captura bem-sucedida;
- fila do dia concluída;
- fechamento ganho.

Regras:
- muito baixo;
- curto;
- desligável;
- nunca em erro repetitivo;
- nunca necessário para compreensão.

---

# 6. Microcoisas para a LANDING — sem redesenhar

## Hero
Preservar estrutura/copy que já funciona.

Refinar:
- um foco visual claro;
- CTA primário dominante e secundário subordinado;
- screenshot/produto real legível;
- animação única demonstrando “mensagem → Capture → Radar → ação”;
- não autoplayar um show infinito;
- animação pode pausar quando fora da viewport.

## Prova do produto
Melhor que ilustração genérica:
- screenshot real;
- hotspot discreto;
- um alerta real de demo;
- zoom leve ao usuário pedir/hover;
- aspect ratio preservado.

## Scroll
- reveal curto, 180–300 ms;
- stagger pequeno entre cards;
- nenhuma seção espera animação para ser lida;
- sem animar todos os textos palavra por palavra.

## CTA
- hover claro;
- press claro;
- seta/ícone pode deslocar poucos pixels;
- não fazer CTA correr do cursor;
- CTA sticky somente se testes mostrarem que ajuda sem atrapalhar.

## Gatilho visual de perda
Mostrar produto resolvendo um problema:
“6 retornos vencidos”
“R$ X aguardando decisão”
somente quando rotulado como DEMO ou baseado em dados reais.

## Confiança
Próximo de CTA ou Capture:
- “O Aether não envia mensagens sozinho.”
- “Você confirma antes da ação.”
- “Dados separados por empresa.”
Somente claims tecnicamente verdadeiros.

## FAQ
- accordion curto;
- abertura suave;
- âncora/URL se fizer sentido;
- primeira pergunta deve remover maior objeção.

## Pricing
- um plano deve parecer simples;
- evitar badges artificiais “MAIS VENDIDO” se não houver base;
- mostrar claramente teste, preço e cancelamento quando aplicável.

---

# 7. NOVAS FUNÇÕES com maior aderência ao futuro do mercado

## Momentum explicável
Em vez de score 82/100:

“Esquentando”
- respondeu recentemente;
- próxima ação definida;
- proposta avançando.

“Estável”

“Esfriando”
- sem interação há X dias;
- próxima ação vencida;
- tempo na etapa acima do padrão.

Sempre mostrar “por quê”.

## Next Best Action baseado primeiro em regras
Exemplo:
Proposta + 4 dias sem interação + sem próxima ação:
“Sugestão: fazer follow-up hoje.”
“Por quê: proposta enviada há 4 dias e nenhum retorno agendado.”

Começar determinístico antes de IA mais cara.

## Briefing antes do WhatsApp
Antes de abrir:
- valor;
- última interação;
- estágio;
- objeção;
- combinado anterior;
- próxima ação.

Objetivo: reduzir tempo para reconstruir contexto.

## Extração estruturada com confirmação
De texto capturado/anotação:
“vou ver com meu sócio e respondo sexta”

Aether sugere:
- status: aguardando decisão;
- decisor adicional: sócio;
- retorno: sexta.

Usuário confirma antes de alterar.

## Anomalia de tempo
“Esta proposta está há 7 dias nesta etapa. O normal recente da sua operação é ~3.”

Somente quando houver dados suficientes.
Não fingir precisão.

## Deal velocity
Tempo por etapa e tendência simples.

## Busca inteligente
Futuro próximo:
“propostas acima de 5 mil sem retorno há 5 dias”.

Pode começar com filtros compostos antes de LLM.

---

# 8. CHECKPOINTS — 10 blocos × 3 = 30 entregas

Cada subcheckpoint deve ser pequeno, testável, commitável e deployável.

Fluxo obrigatório:
objetivo → implementar → validar → corrigir → commit → próximo.

Não juntar A1+A2+A3 num commit gigante.

## A — Motion Foundation

### A1 — Tokens de motion
Implementar:
- durations;
- easing;
- reduced-motion;
- nomes consistentes.

Aceite:
- nenhuma regressão;
- tokens reutilizados em vez de valores espalhados;
- hover/press não parecem lentos.

### A2 — Estados interativos
Aplicar tokens a:
- botão;
- input;
- chip;
- nav;
- cards clicáveis;
- focus/pressed/disabled.

Aceite:
- feedback começa imediatamente;
- sem layout shift;
- keyboard focus claro.

### A3 — Continuidade espacial
Aplicar em:
- dropdown;
- modal;
- drawer;
- detalhe;
- reordenação.

Aceite:
- usuário entende origem/destino;
- saída mais rápida que entrada quando apropriado;
- motion desativável.

## B — Velocidade percebida e feedback

### B1 — Optimistic feedback
Implementar estado local imediato onde for seguro:
- salvar;
- mover etapa;
- concluir ação.

Aceite:
- clique parece imediato;
- falha reverte corretamente;
- não mentir que salvou antes da confirmação final.

### B2 — Loading premium
Criar:
- skeletons que imitam layout real;
- progress onde há progresso real;
- loader repetitivo com timing testável.

Aceite:
- nada “pula” ao carregar;
- sem spinner para operações instantâneas;
- A/B ou QA perceptivo em waits reais.

### B3 — Undo e recuperação
Adicionar Undo para ações reversíveis de baixo risco.

Aceite:
- ação reversível por janela curta;
- feedback “desfeito”;
- ações destrutivas continuam protegidas.

## C — Atenção visual no APP

### C1 — Hierarquia de prioridade
Refinar Hoje/Radar:
- 1 ação principal;
- secundárias com menos peso;
- highlight inicial único.

Aceite:
- primeiro item óbvio em 2–3 segundos;
- nenhuma competição de cinco cores.

### C2 — Tempo humano e urgência
Implementar:
- há X dias;
- vence em X;
- aguardando há X;
- data absoluta secundária.

Aceite:
- estados de hoje/vencido/aguardando distinguíveis por texto + ícone + cor.

### C3 — Agrupamento e whitespace
Revisar:
- proximidade;
- divisões;
- densidade;
- títulos;
- cards.

Aceite:
- grupos relacionados parecem grupos;
- menos caixas desnecessárias;
- sem grandes áreas vazias acidentais.

## D — Psicologia de satisfação no APP

### D1 — Progresso verdadeiro
Adicionar:
- prioridades resolvidas/total;
- onboarding essencial;
- progresso de importação quando real.

Aceite:
- nenhum progresso inventado;
- estado de conclusão claro.

### D2 — Loss framing ético
Usar dados reais:
- valor aguardando;
- atrasados;
- oportunidades esfriando.

Aceite:
- sempre explicar regra;
- sempre oferecer ação de recuperação;
- sem linguagem alarmista.

### D3 — Peak/end e celebração rara
Criar experiência especial para:
- primeira captura;
- primeira oportunidade ganha;
- fila zerada.

Aceite:
- não repetir excessivamente;
- som opcional;
- reduced motion respeitado;
- usuário pode continuar imediatamente.

## E — Landing: gatilhos visuais sem redesign

### E1 — Hero e prova imediata
Preservar estrutura.
Refinar:
- hierarquia;
- CTA;
- screenshot;
- mini demonstração do fluxo Capture→Radar.

Aceite:
- mensagem entendível sem scroll;
- animação não cobre copy;
- mobile mantém foco.

### E2 — Choreography de scroll
Aplicar reveals/staggers discretos e consistentes.

Aceite:
- conteúdo continua legível sem JS/motion;
- sem scroll-jacking;
- no máximo um foco animado relevante por viewport.

### E3 — Confiança e conversão
Refinar:
- claims verificáveis;
- objeções;
- FAQ;
- CTA;
- produto real;
- social proof somente quando real.

Aceite:
- zero prova inventada;
- zero escassez falsa;
- zero “mais vendido” sem dados.

## F — Tipografia, proporção e responsividade

### F1 — Tipografia
Comparar de forma controlada fontes adequadas a dashboard e landing.
Preferir next/font para self-host/otimização.

Aceite:
- números/tabelas legíveis;
- headings não gigantes;
- sem layout shift perceptível;
- line-height consistente.

### F2 — Proporção
Revisar:
- card;
- botão;
- ícone;
- sidebar;
- modal;
- hero;
- screenshot;
- max-width;
- grid.

Aceite:
- nenhum elemento parece “grande porque sim”;
- screenshots sem deformação;
- densidade adequada.

### F3 — Breakpoint QA
Testar:
- desktop grande;
- PC comum;
- notebook;
- tablet horizontal;
- tablet vertical;
- mobile grande;
- mobile pequeno.

Aceite:
- zero overflow acidental;
- alvos tocáveis;
- modais acessíveis;
- hero e Radar legíveis.

## G — Fluidez de produtividade

### G1 — Command Palette
Ctrl/Cmd+K:
- buscar contato/oportunidade;
- ir para Hoje/Pipeline;
- criar oportunidade;
- ações seguras.

Aceite:
- funciona por teclado;
- comandos mostram atalhos.

### G2 — Quick Peek e inline actions
Adicionar acesso a contexto sem navegação desnecessária.

Aceite:
- não perder scroll/seleção;
- Esc volta;
- foco restaurado.

### G3 — Progressive disclosure
Campos avançados só aparecem quando úteis.

Aceite:
- fluxo básico mais curto;
- funcionalidades avançadas continuam encontráveis.

## H — Inteligência útil e explicável

### H1 — Momentum
Implementar regra simples e auditável:
esquentando / estável / esfriando.

Aceite:
- “por que” sempre disponível;
- sem score opaco.

### H2 — Next Best Action + briefing
Sugestão determinística + resumo antes do WhatsApp.

Aceite:
- usuário confirma;
- nunca envia automaticamente;
- sugestão mostra motivo.

### H3 — Structured extraction
Transformar texto/anotação em sugestão de campos.

Aceite:
- alteração só após confirmação;
- mostrar o que será modificado;
- fallback manual sempre existe.

## I — Segurança e privacidade profissional

### I1 — HTTP hardening
Revisar/adicionar quando compatível:
- Content-Security-Policy;
- frame-ancestors;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- HSTS no ambiente apropriado.

Aceite:
- login/Capture/Next continuam funcionando;
- CSP testada antes de endurecer produção.

### I2 — Abuse protection real
Revisar:
- login;
- recuperação;
- importação;
- exportação;
- mutações.

Adicionar throttling/rate limiting servidor quando necessário.

Aceite:
- localStorage não é tratado como defesa;
- mensagens não revelam informação sensível;
- testes para abuso básico.

### I3 — Extensão mínima
Revisar:
- permissões tabs/storage;
- remover o que não for usado;
- sanitização;
- DOM adapter isolado;
- PII;
- falha segura.

Aceite:
- menor conjunto possível de permissões;
- Capture nunca recebe poder desnecessário;
- teste com DOM inesperado.

## J — Performance, qualidade e experimentação

### J1 — Medir UX real
Instrumentar/avaliar:
- INP;
- LCP;
- CLS;
- tempos de ações críticas.

Aceite:
- baseline antes/depois;
- não aprovar “mais bonito” se piorar muito interação.

### J2 — Motion performance
Auditar:
- transform/opacity;
- reflow;
- imagens;
- fontes;
- animação fora de viewport.

Aceite:
- motion suave em hardware modesto;
- sem CLS causado por efeito visual.

### J3 — Visual regression + experimentos
Criar screenshots de referência para breakpoints e testar hipóteses importantes.

Aceite:
- antes/depois documentado;
- experimento tem hipótese;
- não fazer A/B aleatório apenas por estética;
- encerrar checkpoint com build/typecheck/testes relevantes.

---

# 9. Ordem recomendada

Para máximo ganho de qualidade sem parar vendas:

1. A1 → A2 → B1
2. C2 → C1 → F1
3. F2 → F3 → A3
4. B2 → B3 → D1
5. E1 → E2 → E3
6. D2 → D3 → G2
7. G1 → G3 → H1
8. H2 → H3
9. I1 → I2 → I3
10. J1 → J2 → J3

H pode começar depois que Capture e Radar estiverem estáveis.

Não bloquear melhorias pequenas esperando “a fase de IA”.

---

# 10. Regras de qualidade

- Não redesenhar a landing.
- Não implementar 30 checkpoints de uma vez.
- Cada checkpoint deve gerar mudança observável.
- Preferir 3 melhorias excelentes a 15 efeitos medianos.
- Motion nunca pode impedir ação.
- Motion nunca substitui texto/estado.
- Feedback deve começar rapidamente.
- A ação frequente deve ser mais rápida que a ação rara.
- Expressive motion é raro.
- Reduced motion é obrigatório.
- Som é opcional.
- Não inventar prova social.
- Não inventar risco financeiro.
- Não usar dark patterns.
- Não piorar performance para parecer “premium”.
- Testar hardware/tela realista, não apenas monitor de desenvolvimento.
- Quando a literatura não der número universal, testar em vez de fingir certeza.

---

# 11. Fontes principais consultadas

Mercado/produto:
- HubSpot Fall 2026 Spotlight — https://www.hubspot.com/media-kit?product=breeze
- HubSpot Spring 2026 Spotlight — https://www.hubspot.com/spotlight
- Pipedrive AI Sales Assistant — https://www.pipedrive.com/en/features/ai-sales-assistant
- Attio enriched data — https://attio.com/help/reference/managing-your-data/enriched-data
- Notion keyboard shortcuts — https://www.notion.com/help/keyboard-shortcuts
- Slack keyboard shortcuts — https://slack.com/help/articles/201374536-Slack-keyboard-shortcuts
- Slack accessibility — https://slack.com/help/articles/4455747966739-Accessibility-in-Slack
- Duolingo streak animation — https://blog.duolingo.com/streak-milestone-design-animation/
- Microsoft Fluent Motion — https://fluent2.microsoft.design/motion
- Atlassian Motion — https://atlassian.design/foundations/motion
- Webflow microinteractions — https://webflow.com/blog/microinteractions
- Figma Motion — https://www.figma.com/blog/introducing-figma-motion/
- Intercom Product Tours best practices — https://www.intercom.com/help/en/articles/3095688-best-practices-for-using-product-tours
- Shopify Polaris/web components — https://shopify.dev/docs/api/app-home/latest/web-components
- Superhuman product/speed design — https://blog.superhuman.com/the-fastest-email-experience-ever-made/

Pesquisa científica:
- Ding, Y.; Kyung, E. J. Optimizing Animation Speed: Convex Effects on Perceived Waiting Time and Digital Customer Experience. Journal of Consumer Research. DOI: https://doi.org/10.1093/jcr/ucaf037
- Ma, J. Y.; Xie, J. F.; Chen, C.-C. Exploring the Structural Relationships of Microinteractions... International Journal of Human–Computer Interaction. DOI: https://doi.org/10.1080/10447318.2024.2303552
- Kivetz, R.; Urminsky, O.; Zheng, Y. The Goal-Gradient Hypothesis Resurrected. Journal of Marketing Research. DOI: https://doi.org/10.1509/jmkr.43.1.39
- Doi, T.; Doi, S.; Yamaoka, T. The peak–end rule in evaluating product user experience. DOI: https://doi.org/10.1002/hfm.20951
- CHI / ACM literature on aesthetic-usability, processing fluency, saliency and interface animation was reviewed as supporting evidence; treat effects as context-dependent and validate in Aether.

Performance / segurança / acessibilidade:
- Next.js font optimization — https://nextjs.org/docs/app/getting-started/fonts
- Next.js production checklist — https://nextjs.org/docs/app/guides/production-checklist
- Chrome extension security — https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure
- W3C WCAG 2.2 — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- OWASP CSP Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

---

# 12. Resultado esperado

O Aether não precisa parecer “cheio de animações”.

Precisa parecer:
- imediato;
- estável;
- preciso;
- claro;
- prazeroso;
- inteligente;
- confiável.

A sensação desejada é:

“Eu clico e ele responde.”
“Eu sempre sei o que aconteceu.”
“Eu sei o que fazer agora.”
“Eu não tenho medo de errar.”
“O sistema lembra do contexto por mim.”
“Parece um produto profissional, não um painel improvisado.”

O diferencial não será um efeito específico.

Será a soma de dezenas de detalhes coerentes: tempo, motion, feedback, hierarquia, contexto, controle e inteligência.
