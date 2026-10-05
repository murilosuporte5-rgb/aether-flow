-- Keep the public offer and the real trial duration aligned without rewriting history.
update public.companies
set trial_ends_at = trial_started_at + interval '7 days'
where subscription_status = 'trial'
  and trial_started_at is not null
  and trial_ends_at > trial_started_at + interval '7 days';

create or replace function private.clamp_initial_trial_duration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.subscription_status = 'trial' and new.trial_started_at is not null then
    new.trial_ends_at := least(
      coalesce(new.trial_ends_at, new.trial_started_at + interval '7 days'),
      new.trial_started_at + interval '7 days'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists companies_initial_trial_duration on public.companies;
create trigger companies_initial_trial_duration
before insert on public.companies
for each row execute function private.clamp_initial_trial_duration();
