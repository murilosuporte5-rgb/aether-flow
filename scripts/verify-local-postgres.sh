#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

container_name=${AETHER_PG_CONTAINER:-aether-dev-pg}
database_name=${AETHER_TEST_DB_NAME:-aether_verify_$(date +%s)_$RANDOM}
if [[ ! "$database_name" =~ ^[a-z][a-z0-9_]{0,62}$ ]]; then
  printf 'Invalid disposable database name.\n' >&2
  exit 1
fi

docker exec "$container_name" createdb -U postgres "$database_name"
docker exec -i "$container_name" psql -U postgres -d "$database_name" -v ON_ERROR_STOP=1 -1 < tests/local-supabase-bootstrap.sql >/dev/null

migration_count=0
for migration in supabase/migrations/*.sql; do
  docker exec -i "$container_name" psql -U postgres -d "$database_name" -v ON_ERROR_STOP=1 -1 < "$migration" >/dev/null
  migration_count=$((migration_count+1))
done

for check in \
  tests/company-branding-boundary.sql \
  tests/company-branding-integration.sql \
  tests/company-modules-integration.sql \
  tests/crm-import-integration.sql \
  tests/contact-fields-integration.sql \
  tests/core-acceptance.sql \
  tests/core-mutation-boundary.sql \
  tests/business-mutation-boundary.sql \
  tests/daily-mutation-boundary.sql \
  tests/demo-acceptance.sql; do
  docker exec -i "$container_name" psql -U postgres -d "$database_name" -v ON_ERROR_STOP=1 < "$check" >/dev/null
  printf 'PASS %s\n' "${check##*/}"
done

owner_a=$(docker exec "$container_name" psql -U postgres -d "$database_name" -Atc "set role authenticated; set request.jwt.claim.sub='10000000-0000-4000-8000-000000000001'; select accent_color from public.company_branding where company_id='20000000-0000-4000-8000-000000000001'" | tail -n 1)
owner_b=$(docker exec "$container_name" psql -U postgres -d "$database_name" -Atc "set role authenticated; set request.jwt.claim.sub='10000000-0000-4000-8000-000000000004'; select accent_color from public.company_branding where company_id='20000000-0000-4000-8000-000000000002'" | tail -n 1)
module_off=$(docker exec "$container_name" psql -U postgres -d "$database_name" -Atc "set role authenticated; set request.jwt.claim.sub='10000000-0000-4000-8000-000000000001'; select enabled from public.company_modules where company_id='20000000-0000-4000-8000-000000000001' and module_key='messages'" | tail -n 1)
[[ "$owner_a" == '#216d51' && "$owner_b" == '#684c95' && "$module_off" == 'f' ]]

printf 'PASS separate-session persistence and module setting\n'
printf 'Migrations: %s; disposable database retained: %s\n' "$migration_count" "$database_name"
