# AETHER FLOW — RETA FINAL

O produto já recebeu a maior parte das melhorias planejadas. Não repita trabalho já concluído.

## Regra principal de execução

ANTES DE CADA CHECKPOINT:

1. releia este arquivo inteiro;
2. confira o `main` atual e os commits recentes;
3. confirme se o checkpoint ainda não foi resolvido;
4. se já estiver resolvido, pule;
5. só então implemente.

Ao terminar o checkpoint:

1. teste;
2. revise visualmente;
3. corrija;
4. faça commit;
5. releia este arquivo inteiro novamente antes de começar o próximo.

Não siga uma lista antiga de memória. O `main` atual é a fonte da verdade.

Quando houver decisão relevante de UX, responsividade, motion, conversão, tipografia ou comportamento, pesquise referências atuais e evidência de HCI/design systems antes de escolher.

---

# CHECKPOINT 1 — MOBILE PRIMEIRO

## Situação

O mobile ainda não está bom o suficiente.

Já houve correções de drawer, overflow e breakpoints, mas isso não significa que a experiência visual esteja boa.

Não considere “sem overflow” como sinônimo de “mobile bem resolvido”.

## Objetivo

Fazer o Aether parecer um produto realmente pensado para celular, não uma interface desktop comprimida.

## Revisar visualmente

Testar pelo menos:

- 320 px;
- 360 px;
- 390 px;
- 412 px;
- 430 px;
- 768 px.

Revisar app autenticado e landing.

## Corrigir principalmente

- header grande demais;
- drawer/menu ocupando espaço demais;
- cards altos ou largos demais;
- excesso de informação ao mesmo tempo;
- textos muito pequenos;
- textos quebrando de forma feia;
- botões pequenos ou apertados;
- botões ocupando largura excessiva;
- modais maiores que a viewport;
- formulários cansativos;
- campos apertados;
- pipeline difícil de navegar;
- Radar/Hoje com densidade ruim;
- detalhes da oportunidade com informação demais;
- espaços vazios estranhos;
- scroll horizontal;
- elementos fixos cobrindo conteúdo;
- CTA fora da área confortável do polegar;
- inconsistência entre 360 e 390 px;
- landing com hero, screenshots ou cards desproporcionais.

## Como validar

Não validar apenas via DOM.

Para cada largura importante:
- abrir a interface;
- observar a tela real;
- tirar screenshot quando possível;
- verificar hierarquia visual;
- verificar se a ação principal está óbvia;
- conferir toque, scroll e modal;
- corrigir até a interface parecer natural naquela largura.

Preserve desktop enquanto melhora mobile.

---

# CHECKPOINT 2 — FOCUS MODE / RESOLVER PENDÊNCIAS

A fila, persistência, progresso, WhatsApp, resultado e resumo final já existem.

Não recrie.

Refine somente se a experiência ainda estiver pesada.

Objetivo:
**uma oportunidade por vez, uma decisão por vez.**

Melhorar se necessário:
- reduzir elementos secundários durante a fila;
- deixar contexto essencial visível;
- WhatsApp → resultado → próxima ação → próximo item;
- diminuir necessidade de voltar para outras telas;
- mostrar progresso sem poluir;
- permitir sair facilmente;
- manter continuidade após refresh;
- fazer o final da sessão parecer realmente concluído.

Pesquise padrões de foco de Linear, Superhuman, Todoist e apps de processamento de fila antes de alterar.

---

# CHECKPOINT 3 — LOGIN SEM ATRITO REPETITIVO

O aceite de termos já possui versão e persistência, mas o checkbox ainda aparece no login.

Revise o fluxo real.

Se juridicamente e tecnicamente possível:
- não exigir nova ação de aceite em todo login;
- pedir aceite apenas no primeiro uso ou quando a versão mudar;
- usuário autenticado deve ir direto para o produto;
- não adicionar novas telas.

Preserve registro de aceite e segurança.

---

# CHECKPOINT 4 — REFINAR NEXT BEST ACTION E MOMENTUM

Next Best Action e Momentum já existem.

Não recrie.

Agora apenas refine se os dados reais justificarem.

Revisar:
- se as sugestões são realmente úteis;
- se aparecem no momento certo;
- se o motivo é claro;
- se “Esquentando / Estável / Esfriando” não está simplista demais;
- se existe alguma sugestão óbvia errada;
- se o usuário consegue aceitar, alterar ou ignorar sem esforço.

Pode considerar:
- etapa atual;
- última interação;
- próxima ação;
- atraso;
- tempo na etapa;
- responsável;
- estado “aguardando cliente”;
- histórico recente.

Não criar score opaco.
Não mostrar probabilidade de fechamento inventada.

---

# CHECKPOINT 5 — BRIEFING ANTES DO WHATSAPP

O briefing já existe.

Não recrie.

Refine somente o que realmente ajuda antes do contato.

Idealmente mostrar, quando disponível:
- quem é;
- etapa;
- valor;
- última interação;
- o que foi combinado;
- objeção/contexto;
- próxima ação;
- uma indicação curta do que precisa ser resolvido agora.

O briefing deve ser lido em poucos segundos.

Evite:
- texto longo;
- informação repetida;
- nova tela pesada;
- IA inventando contexto.

---

# CHECKPOINT 6 — ACABAMENTO VISUAL DO APP

Não redesenhe.

Faça uma revisão de acabamento do produto atual.

Olhar:
- hierarquia;
- alinhamento;
- tipografia;
- densidade;
- contraste;
- proporções;
- cards;
- botões;
- ícones;
- modais;
- tabelas/listas;
- estados vazios;
- feedback de sucesso/erro;
- loading;
- skeleton;
- animações;
- consistência entre telas.

Pergunta para cada tela:

**“Isso parece um software acabado ou ainda parece uma tela em construção?”**

Corrigir apenas problemas concretos.

---

# CHECKPOINT 7 — LANDING FINAL

A landing já existe e não deve ser redesenhada.

Faça apenas refinamento final.

Revisar:
- hero;
- CTA principal;
- prova visual do produto;
- screenshots;
- proporção mobile;
- legibilidade;
- espaçamento;
- confiança;
- demonstração clara do fluxo Capture → Radar → próxima ação.

No mobile, verificar principalmente:
- altura do hero;
- CTA visível cedo;
- screenshot legível;
- cards sem empilhamento estranho;
- textos sem largura excessiva;
- navegação simples.

Não usar:
- urgência falsa;
- prova social inventada;
- animação excessiva;
- CTA piscando.

---

# CHECKPOINT 8 — LOGO E IDENTIDADE

A marca atual ainda é provisória.

Não faça apenas pequenas alterações aleatórias no mesmo símbolo.

Antes de substituir:
- analisar identidade atual;
- comparar marcas SaaS modernas;
- pensar em legibilidade pequena;
- favicon;
- sidebar;
- mobile;
- fundo claro e escuro;
- versão símbolo;
- versão símbolo + Aether Flow.

A identidade deve transmitir:
- fluxo;
- organização;
- atenção;
- velocidade;
- tecnologia;
- confiança.

Se ainda não houver conceito aprovado pelo usuário, não force uma troca definitiva.
Pode preparar opções vetoriais para comparação.

---

# CHECKPOINT 9 — PERFORMANCE REAL

Já existem métricas e medição de ações.

Não recrie instrumentation sem necessidade.

Agora:
- observar INP, LCP e CLS reais;
- observar ações lentas;
- revisar bundle;
- revisar imagens;
- verificar fontes;
- evitar motion pesado;
- otimizar apenas gargalos comprovados.

Não sacrificar UX por micro-otimização sem impacto.

---

# CHECKPOINT 10 — SEGURANÇA: SOMENTE VERIFICAÇÃO RESTANTE

Headers básicos e CSP já foram trabalhados.

Não refaça segurança do zero.

Verificar apenas:
- CSP funcionando em produção;
- ausência de regressões de login/Capture/Supabase;
- rate limit server-side nos pontos realmente sensíveis;
- permissões mínimas da extensão;
- exposição de PII;
- proteção disponível no plano atual do Supabase.

Se algo já estiver comprovado, não mexer.

---

# CHECKPOINT 11 — QA FINAL COMPLETO

Antes de declarar terminado:

## Visual

Testar:
- 320;
- 360;
- 390;
- 412;
- 430;
- 768;
- 1024;
- 1366;
- 1440+.

## Fluxos

Testar:
- login;
- Capture;
- resultado;
- próxima ação;
- Radar;
- Resolver pendências;
- WhatsApp;
- mudança de etapa;
- Undo;
- criação/edição de oportunidade;
- contatos;
- pipeline;
- landing;
- logout/login novamente.

## Qualidade

Rodar:
- typecheck;
- testes;
- build;
- smoke de produção.

Verificar console do browser.

Corrigir regressões antes de encerrar.

---

# O QUE JÁ ESTÁ FEITO — NÃO REFAZER

Considere já existente e apenas corrija se encontrar bug real:

- Capture básico;
- deduplicação;
- captura manual/mobile;
- resultado rápido;
- próxima ação no Capture;
- fila Resolver pendências;
- persistência da fila;
- progresso da fila;
- resumo final;
- skeletons;
- motion tokens;
- reduced motion;
- Undo de etapa;
- Next Best Action inicial;
- Momentum;
- briefing WhatsApp;
- extração de anotação com confirmação;
- `next/font`;
- timezone centralizado;
- medição de ações críticas;
- QA técnico de overflow em vários breakpoints;
- menu mobile/drawer inicial;
- headers básicos;
- CSP;
- índices/migrations recentes;
- testes/build já existentes.

Não gaste tempo recriando esses itens.

---

# ORDEM

1. Mobile;
2. Focus Mode;
3. Login;
4. Next Best Action / Momentum;
5. Briefing WhatsApp;
6. acabamento visual do app;
7. landing;
8. logo/identidade;
9. performance;
10. segurança restante;
11. QA final.

Depois de CADA item:
**releia este prompt inteiro antes de continuar.**

---

# OBJETIVO FINAL

Não aumentar a quantidade de funcionalidades.

Terminar o produto.

O Aether deve:
- parecer profissional;
- funcionar muito bem no celular;
- continuar bom em tablet e desktop;
- exigir poucos cliques;
- deixar claro o que fazer;
- reduzir trabalho manual;
- responder rápido;
- transmitir confiança.

A sensação final deve ser:

**“Eu abro o Aether, vejo o que importa, resolvo em poucos minutos e saio com tudo sob controle.”**
