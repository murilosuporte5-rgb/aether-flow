-- Optional commercial signal, separate from operational stock/status.
alter table public.operation_products
  add column commercial_availability text
    check (commercial_availability is null or commercial_availability in ('available','reserved','consult'));
