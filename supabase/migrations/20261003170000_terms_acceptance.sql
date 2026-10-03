create table if not exists public.terms_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  document text not null check (document in ('terms','privacy')),
  version text not null check (length(btrim(version)) between 1 and 40),
  accepted_at timestamptz not null default now(),
  primary key (user_id, document, version)
);
alter table public.terms_acceptances enable row level security;
revoke all on public.terms_acceptances from public, anon, authenticated;
grant select on public.terms_acceptances to authenticated;
create policy terms_acceptances_read_own on public.terms_acceptances
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.accept_terms(p_version text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := (select auth.uid());
begin
  if actor is null then raise exception using errcode='42501', message='Sessão necessária.'; end if;
  if p_version is null or length(btrim(p_version)) not between 1 and 40 then raise exception 'Versão de termos inválida.'; end if;
  insert into public.terms_acceptances(user_id, document, version)
    values (actor, 'terms', btrim(p_version)), (actor, 'privacy', btrim(p_version))
    on conflict (user_id, document, version) do nothing;
  return jsonb_build_object('ok', true, 'version', btrim(p_version));
end $$;
revoke all on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated;
