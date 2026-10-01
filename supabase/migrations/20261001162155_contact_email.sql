-- Optional contact email for transactional follow-up.
-- Delivery is performed server-side through Resend; the address remains tenant-scoped.
alter table public.contacts add column if not exists email text;
alter table public.contacts
  add constraint contacts_email_format_check
  check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
