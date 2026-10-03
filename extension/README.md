# Aether Flow Capture

Extensão Chrome MV3 para WhatsApp Web. O adaptador DOM está isolado em `content.js`; se o WhatsApp mudar a interface, ajuste somente `capture()` e os seletores.

1. Abra `chrome://extensions` e ative **Modo do desenvolvedor**.
2. Use **Carregar sem compactação** e selecione esta pasta `extension`.
3. Abra uma conversa no WhatsApp Web e clique em **Adicionar ao Aether**.
4. A captura abre o Aether em uma nova aba. A sessão do Aether deve estar ativa.

A extensão captura somente nome e telefone disponíveis na conversa e nunca envia mensagens. O endereço padrão é a produção Railway; altere `APP_URL` em `content.js` se o ambiente mudar.
