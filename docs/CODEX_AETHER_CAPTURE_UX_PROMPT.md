# PROMPT — AETHER CAPTURE + UX/VISUAL + LANDING

Trabalhe de forma autônoma no repositório atual do **Aether Flow**. Eu vou ficar **offline e não poderei responder perguntas, fornecer credenciais, confirmar decisões ou executar etapas manuais**.

Não pare esperando por mim. Se alguma tarefa depender obrigatoriamente de algo que só eu possa fornecer e não houver alternativa segura:
1. tente outra abordagem;
2. se ainda não for possível, documente o bloqueio;
3. ignore apenas aquela parte e continue com todo o restante.

Antes de alterar qualquer coisa, leia o código atual e preserve o que já funciona. **Não recrie funcionalidades existentes sem necessidade.**

## Regra principal — refinar, não redesenhar

A landing page atual **já está boa e contém estrutura, conteúdo, posicionamento e identidade que quero preservar**.

**NÃO substitua, NÃO refaça do zero e NÃO troque a arquitetura visual inteira da landing.**

O trabalho é incremental: **melhorar o que já existe**.

Preserve:
- seções atuais;
- conteúdo importante;
- posicionamento;
- identidade visual;
- fluxo comercial;
- screenshots e demonstrações úteis;
- estrutura que já funciona.

Só altere estrutura quando existir um problema visual ou de usabilidade concreto e a mudança melhorar claramente o resultado.

## Execução por checkpoints — velocidade + qualidade

Trabalhe em **checkpoints curtos e objetivos**, sem tentar resolver tudo em uma única alteração grande.

Cada checkpoint deve seguir esta lógica:

**1. Objetivo pequeno e claro → 2. Implementar → 3. Validar → 4. Corrigir → 5. Commit → 6. Próximo checkpoint.**

Priorize velocidade, mas **não aceite trabalho visualmente ruim, instável ou incompleto apenas para terminar rápido**.

Regras:
- faça primeiro as mudanças de maior impacto e menor complexidade;
- evite refactors grandes sem necessidade;
- não espere concluir todo o projeto para testar;
- valide cada bloco assim que terminar;
- faça commits pequenos e claros;
- se uma abordagem consumir muito tempo sem resultado, pare, registre o motivo e tente uma solução mais simples;
- mantenha sempre o projeto em estado funcional;
- rode testes proporcionais ao checkpoint;
- antes do encerramento geral, rode typecheck, testes e build completos.

Exemplo de ordem:
- Checkpoint 1: robustez do Capture;
- Checkpoint 2: fluxo pós-contato;
- Checkpoint 3: microinterações principais do app;
- Checkpoint 4: refinamento visual da landing;
- Checkpoint 5: revisão responsiva completa;
- Checkpoint 6: QA final e correções.

## Prioridade 1 — Aether Capture para WhatsApp Web

Continue e refine a implementação atual para reduzir ao máximo o cadastro manual de leads.

Objetivo:

**WhatsApp Web → 1 clique → contato/oportunidade no Aether Flow.**

Valide o Capture no WhatsApp Web real, principalmente:
- captura de telefone em contatos salvos;
- captura de nome;
- conversas em que o telefone não aparece diretamente;
- duplicidade;
- erros de sessão;
- falha de captura;
- comportamento quando o DOM do WhatsApp mudar.

A extensão deve capturar apenas os dados necessários e disponíveis da conversa aberta.

No backend:
- verificar duplicidade;
- reutilizar contato existente;
- criar contato quando necessário;
- criar oportunidade;
- origem = WhatsApp;
- registrar horário;
- retornar feedback claro.

Depois da captura, mantenha ações rápidas como:

**Orçamento · Retorno · Visita · Aguardar cliente · Outro**

Não implementar agora sincronização completa de mensagens, chatbot, envio automático, leitura massiva do WhatsApp ou automações complexas.

Toda dependência do DOM do WhatsApp Web deve ficar isolada em uma camada/adaptador fácil de corrigir.

**Nunca envie mensagens automaticamente.**

## Prioridade 2 — reduzir trabalho depois do contato

Ao retornar do WhatsApp, permitir registrar rapidamente o resultado:

**Respondeu · Não respondeu · Pediu retorno · Proposta enviada · Vai decidir · Fechou**

Use isso para atualizar histórico, status e facilitar a próxima ação.

O objetivo é que o usuário quase não precise “alimentar o CRM”.

## Prioridade 3 — elevar a qualidade visual do que já existe

Melhore a **landing atual** e o **Aether Flow atual**, sem redesenhar tudo.

Refine principalmente:
- hierarquia visual;
- saliência dos elementos importantes;
- tipografia;
- pesos e tamanhos;
- line-height;
- largura de leitura;
- espaçamento;
- contraste;
- proporções;
- estados hover/focus/pressed;
- feedback imediato;
- skeleton/loading;
- estados vazios;
- confirmações;
- alertas;
- consistência visual.

### Microinterações avançadas

Adicione microinterações discretas e satisfatórias em:
- hover;
- clique;
- abertura/fechamento;
- mudança de etapa;
- conclusão de ação;
- captura bem-sucedida;
- loading;
- sucesso;
- erro;
- mudança de estado;
- expansão/recolhimento de componentes.

Use movimento para comunicar **causa e efeito**, não como decoração.

As transições devem ser suaves, rápidas e profissionais. Evite animações longas, exageradas ou que atrasem o usuário.

### Tipografia e sensação de qualidade

Revise a tipografia do app e da landing para melhorar:
- legibilidade;
- ritmo visual;
- hierarquia;
- densidade;
- sensação premium;
- coerência entre títulos, corpo, labels, botões e números.

Não troque fontes apenas por estética. Se houver dúvida, pesquise boas práticas de UI, HCI e legibilidade antes.

### Sons

Se fizer sentido, adicione sons **muito sutis e opcionais** apenas para ações importantes, como captura concluída ou ação finalizada.

Regras:
- volume baixo;
- nunca tocar em excesso;
- fácil de desativar;
- não depender do som para comunicar estado;
- respeitar acessibilidade.

Respeite também `prefers-reduced-motion`.

## Cuidado obrigatório com proporções e composição

Tenha atenção especial às **proporções da landing e do app**. Um layout tecnicamente correto pode continuar parecendo feio se a escala estiver errada.

Revise e corrija:
- heros altos demais;
- cards excessivamente grandes ou pequenos;
- textos largos demais;
- títulos gigantes;
- botões desproporcionais;
- ícones fora de escala;
- espaços vazios excessivos;
- componentes espremidos;
- imagens pequenas em blocos enormes;
- screenshots deformados;
- grids desequilibrados;
- sidebar larga demais;
- modais grandes demais;
- cabeçalhos que empurram conteúdo importante para baixo;
- diferenças ruins de proporção entre desktop e mobile.

Use uma escala consistente de espaçamento e tamanho.

Mantenha:
- `max-width` coerente;
- line-height legível;
- largura de texto confortável;
- aspect ratio correto;
- `object-fit` apropriado;
- screenshots nítidos;
- relação equilibrada entre texto, cards, botões, ícones e imagens.

Se algo funciona, mas visualmente parece estranho, **corrija antes de considerar concluído**.

## Revisão responsiva obrigatória

Teste visualmente as principais telas e a landing em:

- desktop grande;
- PC/monitor comum;
- notebook;
- tablet horizontal;
- tablet vertical;
- mobile pequeno;
- mobile grande.

Não considere a revisão visual concluída olhando apenas uma resolução.

Cheque principalmente:
- quebras;
- overflow;
- áreas vazias;
- componentes fora da dobra;
- textos comprimidos;
- botões difíceis de tocar;
- modais cortados;
- menu/sidebar;
- screenshots;
- hero;
- grids;
- densidade da informação.

## Psicologia, conversão e UX

Use psicologia comportamental e UX para melhorar:
- clareza;
- atenção;
- percepção de valor;
- confiança;
- redução de carga cognitiva;
- sensação de progresso;
- conclusão;
- redução de fricção;
- reconhecimento em vez de memorização;
- feedback imediato;
- saliência;
- aversão à perda quando legítima;
- prova do produto.

Pode usar gatilhos visuais e psicológicos, mas **sem dark patterns**.

Não invente:
- depoimentos;
- clientes;
- métricas;
- escassez;
- urgência;
- prova social.

Quando houver dúvida sobre psicologia, persuasão, UX, conversão, microinterações ou design comportamental, **pesquise antes de decidir**.

Priorize:
- livros reconhecidos;
- estudos científicos;
- HCI/UX;
- fontes confiáveis;
- evidência prática consistente.

Não aplique “gatilho mental” apenas porque parece bonito.

## Landing page

**Não crie uma landing nova.**

Use a landing atual como base e refine apenas o necessário.

O objetivo é fazer o usuário entender ainda mais rapidamente:

**“Continue vendendo pelo WhatsApp. O Aether captura suas oportunidades e mostra quem precisa da sua atenção.”**

Melhore principalmente:
- ordem visual;
- saliência dos benefícios;
- CTAs;
- leitura;
- confiança;
- demonstração do produto;
- microinterações;
- transições;
- percepção de qualidade;
- consistência entre seções.

Use produto real sempre que possível.

Evite adicionar texto desnecessário ou remover conteúdo importante sem motivo.

## Regras de execução

- Preserve compatibilidade com Railway + Supabase.
- Trabalhe sobre a arquitetura existente.
- Não introduza dependências pesadas sem necessidade.
- Não expanda agora recursos secundários.
- Não substitua landing ou app por redesign completo.
- Não quebre funções existentes para melhorar estética.
- Faça alterações incrementais.
- Teste cada checkpoint.
- Corrija regressões imediatamente.
- Não declare concluído algo que não foi validado.
- Se uma solução falhar, investigue e tente outra.
- Não espere minha resposta.
- Se uma decisão for reversível, escolha a alternativa mais simples e segura e prossiga.
- Priorize **velocidade com qualidade**, funcionamento real, consistência e facilidade de uso.

## Objetivo final

O Aether deve fazer o cliente sentir:

**“Eu continuo trabalhando do jeito que já trabalho, mas agora as oportunidades entram no sistema com muito menos esforço e eu sei exatamente quem precisa da minha atenção.”**

E visualmente deve transmitir:

**produto confiável, rápido, moderno, profissional e prazeroso de usar — sem perder a identidade e a estrutura que já construímos.**
