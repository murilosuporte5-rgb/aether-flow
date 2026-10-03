# PROMPT — AETHER CAPTURE + UX/VISUAL + LANDING

Trabalhe de forma autônoma no repositório atual do **Aether Flow**. Eu vou ficar **offline e não poderei responder perguntas, fornecer credenciais, confirmar decisões ou executar etapas manuais**.

Não pare o trabalho esperando por mim. Se alguma tarefa depender obrigatoriamente de algo que só eu possa fornecer e não houver alternativa segura:
1. tente outra abordagem;
2. se ainda não for possível, documente claramente o bloqueio;
3. ignore apenas aquela parte e continue com todo o restante que puder ser concluído.

Antes de alterar qualquer coisa, leia o código atual e preserve o que já funciona. Não recrie funcionalidades existentes sem necessidade.

## Prioridade 1 — Aether Capture para WhatsApp Web

Comece uma implementação funcional para reduzir ao máximo o cadastro manual de leads.

Objetivo principal:

**WhatsApp Web → 1 clique → contato/oportunidade no Aether Flow.**

Crie uma extensão Chrome simples, separada do núcleo do app, que permita ao usuário, dentro de uma conversa aberta do WhatsApp Web, clicar em algo como **“Adicionar ao Aether”**.

A extensão deve tentar capturar apenas os dados necessários e disponíveis da conversa aberta, como nome e telefone, e enviá-los ao Aether.

No backend:
- verificar duplicidade;
- reutilizar o contato quando já existir;
- criar o contato quando necessário;
- criar a oportunidade;
- registrar origem como WhatsApp;
- registrar horário da captura;
- retornar confirmação clara.

Depois da captura, oferecer poucas ações rápidas, por exemplo:

**Orçamento · Retorno · Visita · Aguardar cliente · Outro**

Não implementar agora sincronização completa de mensagens, chatbot, envio automático, leitura massiva do WhatsApp ou automações complexas.

Toda dependência do DOM do WhatsApp Web deve ficar isolada em uma camada/adaptador fácil de corrigir caso a interface mude.

**Nunca envie mensagens automaticamente.**

## Prioridade 2 — reduzir trabalho depois do contato

Ao retornar do WhatsApp, permitir registrar rapidamente o resultado do contato:

**Respondeu · Não respondeu · Pediu retorno · Proposta enviada · Vai decidir · Fechou**

Use esse resultado para atualizar histórico, status e facilitar a próxima ação.

O objetivo é que o usuário quase não precise “alimentar o CRM”.

## Prioridade 3 — melhorar fortemente a qualidade visual

Melhore tanto a **landing page** quanto o **Aether Flow**.

O resultado deve parecer um SaaS comercial profissional, moderno e consistente, não um projeto genérico.

Trabalhe:
- hierarquia visual;
- espaçamento;
- tipografia;
- contraste;
- estados hover/focus/pressed;
- microinterações;
- transições suaves;
- feedback visual imediato;
- loading/skeleton;
- estados vazios;
- confirmação visual de ações;
- animações pequenas e úteis;
- sensação de continuidade entre ações.

Use movimento para comunicar estado e causa/efeito, não apenas decoração.

Adicione sons sutis e satisfatórios somente onde realmente ajudam, por exemplo em uma captura ou ação concluída. Sons devem ser discretos, opcionais e fáceis de desativar. Respeite `prefers-reduced-motion`.

## Cuidado obrigatório com proporções e composição

Tenha atenção especial às **proporções da landing page e do app**, porque layouts anteriores às vezes ficam visualmente desequilibrados, grandes demais, apertados ou com elementos fora de escala.

Revise cada tela em desktop e mobile e evite:
- heros altos demais;
- cards excessivamente grandes ou pequenos;
- textos largos demais para leitura;
- botões desproporcionais;
- ícones maiores que a hierarquia permite;
- excesso de espaço vazio;
- componentes espremidos;
- screenshots deformados;
- imagens esticadas;
- grids com colunas de larguras ruins;
- sidebar ocupando espaço demais;
- modais maiores que o necessário;
- títulos gigantes sem necessidade;
- cabeçalhos que empurram o conteúdo importante para baixo.

Use uma escala consistente de espaçamento e tamanho. Mantenha `max-width` coerente, line-height legível, largura de texto confortável e proporção visual equilibrada entre texto, cards, botões, ícones e imagens.

Ao usar screenshots ou mockups do produto:
- preserve o aspect ratio original;
- nunca estique;
- use `object-fit` corretamente;
- mantenha resolução nítida;
- evite deixar imagem muito pequena dentro de um bloco enorme;
- garanta que a captura mostre algo relevante e legível.

Teste visualmente pelo menos:
- desktop largo;
- notebook;
- tablet;
- mobile.

Se algo tecnicamente funciona mas visualmente parece estranho, **corrija antes de considerar concluído**.

## Psicologia, conversão e UX

Use princípios de psicologia comportamental e UX para tornar a experiência mais clara, desejável e fácil de entender.

Pode explorar:
- saliência;
- redução de carga cognitiva;
- reconhecimento em vez de memorização;
- feedback imediato;
- progressão;
- sensação de conclusão;
- prova social real;
- aversão à perda;
- clareza de valor;
- redução de fricção;
- efeito de progresso.

Não invente depoimentos, números, clientes, escassez, urgência ou prova social falsa. Não use dark patterns.

Quando tiver dúvida sobre psicologia, persuasão, UX, conversão, microinterações ou design comportamental, **pesquise antes de decidir**. Priorize livros reconhecidos, estudos científicos, HCI/UX e fontes confiáveis. Não aplique “gatilho mental” apenas porque parece bonito.

## Landing page

A landing deve comunicar em poucos segundos:

**“Continue vendendo pelo WhatsApp. O Aether captura suas oportunidades e mostra quem precisa da sua atenção.”**

Mostre visualmente o fluxo:

**Mensagem chega → Adicionar ao Aether → oportunidade criada → Radar identifica prioridade → vendedor age.**

Use produto real sempre que possível. Evite textos enormes e seções redundantes.

A página deve conduzir naturalmente para demonstração/teste, usando contraste, ordem visual e prova do produto — não excesso de copy.

## Regras de execução

- Preserve compatibilidade com Railway + Supabase.
- Trabalhe sobre a arquitetura existente.
- Não introduza dependências pesadas sem necessidade.
- Não expanda agora recursos secundários que desviem do núcleo comercial.
- Rode typecheck, testes e build depois das mudanças.
- Corrija erros encontrados durante o processo.
- Faça mudanças incrementais e commits claros.
- Não declare algo como concluído se não estiver funcionando.
- Se uma solução falhar, investigue a causa e tente outra.
- Não espere minha resposta para continuar.
- Se uma decisão for reversível, escolha a alternativa mais simples e segura e prossiga.
- Priorize funcionamento real, clareza visual, consistência e facilidade de uso acima de quantidade de funcionalidades.

## Objetivo final

O Aether deve fazer o cliente sentir:

**“Eu continuo trabalhando do jeito que já trabalho, mas agora as oportunidades entram no sistema com muito menos esforço e eu sei exatamente quem precisa da minha atenção.”**

Prioridade máxima: **reduzir trabalho manual, tornar a captura de oportunidades extremamente simples e fazer o valor do Aether ser percebido imediatamente.**
