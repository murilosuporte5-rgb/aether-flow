# Aether Works · Oportunidades

Aplicação Next.js com Supabase Auth/Postgres e isolamento por empresa. A tela Hoje, a lista, o pipeline e o histórico compartilham dados persistidos. Os 12 nichos usam o mesmo código e têm etapas e dados fictícios próprios no modo DEMONSTRAÇÃO.

## Configuração

1. Configure um projeto Supabase dedicado e aplique as migrações em `supabase/migrations` pela ordem.
2. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` e `APP_BASE_URL` conforme `.env.example`. A chave `SUPABASE_SECRET_KEY` só pode ficar no servidor; nunca use prefixo `NEXT_PUBLIC_` nela.
3. Em **Supabase → Authentication → Settings**, desative cadastro público. Em **URL Configuration**, configure a URL publicada como Site URL e permita `https://SEU-DOMINIO/activate` nos Redirect URLs. Configure SMTP próprio e remetente autenticado em **SMTP Settings** antes de enviar convites reais. O serviço padrão de e-mail do Supabase serve apenas para testes limitados.
4. Em Vercel, crie um projeto Next.js, configure as quatro variáveis para Production, Preview e Development conforme a necessidade e publique. `APP_BASE_URL` deve ser exatamente a origem publicada, sem barra final. Em uso comercial, confira o plano Vercel adequado.
5. Após configurar SMTP e URL, execute localmente `node --env-file=.env.local scripts/bootstrap-admin.mjs voce@aetherworks.com.br`. O convite para essa pessoa cria o primeiro administrador. Ela define a senha no link recebido.
6. O administrador entra em `/admin`, informa o nome da empresa, e-mail do responsável e nicho. Cada convite cria uma empresa independente com etapas próprias. O destinatário define senha; nos acessos seguintes usa `/login` com e-mail e senha. Não existe tela de cadastro público.

## Desenvolvimento

```bash
npm ci
npm run dev
npm run check
npm run build
```

O modo DEMONSTRAÇÃO cria 16 oportunidades fictícias por nicho para o administrador. Empresas reais começam vazias. A troca de nicho altera somente o ambiente demo; as empresas de clientes mantêm seus processos e dados. A ação WhatsApp abre `wa.me` quando há telefone brasileiro válido, sem automação nem envio por conta do sistema.

## Segurança e operação

- Toda leitura e escrita de dados de clientes exige sessão Supabase e RLS por associação em `memberships`.
- Chaves administrativas são usadas somente no servidor para provisionamento. `/api/admin/invite` exige sessão de administrador Aether e verifica a origem.
- O banco usa chaves estrangeiras compostas para evitar referências entre empresas mesmo em registros malformados.
- Configure limites de autenticação e proteção contra abuso na Supabase/Vercel antes de distribuir a URL amplamente. Não compartilhe uma senha única entre clientes.
- Cada alteração de dados gera histórico. Em falha de rede entre gravações, atualize a tela antes de repetir uma ação; o endpoint informa essa possibilidade.
