# Aether Flow Capture

Extensão Chrome MV3 para puxar o lead da conversa ativa no WhatsApp Web para o Aether Flow. O adaptador DOM está isolado em `content.js`; se o WhatsApp mudar a interface, ajuste somente `capture()` e os seletores.

1. Abra `chrome://extensions` e ative **Modo do desenvolvedor**.
2. Use **Carregar sem compactação** e selecione esta pasta `extension`.
3. Abra uma conversa no WhatsApp Web e clique em **Capturar lead**.
4. A captura abre o Aether em uma nova aba e cria o contato e a oportunidade no ambiente da empresa. A sessão do Aether deve estar ativa.
5. Para abrir a captura sem estar em uma conversa, clique no ícone da extensão no Chrome.

A extensão captura somente nome e telefone disponíveis na conversa ativa, mantém os dados pessoais no fragmento da URL e nunca envia mensagens. No celular, use `/capturar` e preencha o formulário, porque extensões Chrome não rodam dentro do WhatsApp mobile. O endereço padrão é a produção Railway; altere `APP_URL` em `content.js` e `background.js` se o ambiente mudar.
