# E-mail transacional

O Aether Flow mantém a chave do provedor no servidor. A tela de contatos usa `POST /api/email/send`; o destinatário é sempre o e-mail salvo no contato da mesma empresa e nunca vem de um campo livre do navegador.

## Variáveis da aplicação

Configure no Railway, apenas no serviço web:

- `RESEND_API_KEY`: chave da API do Resend.
- `RESEND_FROM_EMAIL`: remetente verificado, por exemplo `Aether Flow <no-reply@seudominio.com>`.
- `RESEND_REPLY_TO`: opcional, para respostas da equipe.

Sem essas variáveis, a tela informa que o envio ainda não foi configurado e não tenta enviar dados para fora.

## Supabase Auth

Recuperação de senha, confirmação de cadastro e convites continuam no Supabase Auth. Para que esses links cheguem a destinatários reais, configure o Resend como SMTP personalizado do projeto:

- host `smtp.resend.com`;
- porta `465` (SSL) ou `587` (STARTTLS);
- usuário `resend`;
- senha: uma API key do Resend;
- remetente: o mesmo domínio verificado em `RESEND_FROM_EMAIL`.

Também é possível usar a integração oficial do Resend no Supabase. Depois de configurar, valide o redirect de produção para `/auth/confirm?type=recovery` e teste com uma conta de teste. O fluxo atual envia um link de recuperação seguro; ele não expõe senha ou token no aplicativo.

Referências oficiais: [Supabase custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [integração Resend + Supabase](https://supabase.com/partners/resend) e [Resend com Next.js](https://resend.com/nextjs).
