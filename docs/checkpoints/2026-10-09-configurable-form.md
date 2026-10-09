# Checkpoint: formulário configurável de oportunidades

O formulário de criação de oportunidades agora exibe os campos de contato ativos configurados pela empresa. Os valores são validados no cliente e enviados em `customData`.

A função PostgreSQL `create_opportunity_with_contact_fields` grava a oportunidade e os campos personalizados na mesma transação, usando as funções existentes de comando do workspace e escrita de campos. A repetição idempotente conserva o mesmo resultado; um campo inválido desfaz a criação. A função exige acesso à empresa e os testes cobrem tentativa entre empresas.

## Evidências locais

- `npm run check`: passou.
- `npm test`: 36 testes passaram.
- `npm run build`: passou.
- `bash scripts/verify-local-postgres.sh`: 49 migrações e 11 testes SQL passaram em banco novo, incluindo `configurable-form-integration.sql` e teste de persistência em sessões separadas.

O teste usa PostgreSQL real com um simulador local das funções `auth` do Supabase. A autenticação no navegador ainda requer um ambiente Supabase Auth/PostgREST de desenvolvimento; estes testes não a substituem. A produção não foi alterada.
