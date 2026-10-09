-- Run only on a disposable local database with tests/local-supabase-bootstrap.sql.
-- Fixed IDs allow a second psql process to verify persistence after this one exits.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('10000000-0000-4000-8000-000000000001','owner-a@test.invalid','{"full_name":"Owner A"}'),
('10000000-0000-4000-8000-000000000002','member-a@test.invalid','{"full_name":"Member A"}'),
('10000000-0000-4000-8000-000000000003','admin-a@test.invalid','{"full_name":"Admin A"}'),
('10000000-0000-4000-8000-000000000004','owner-b@test.invalid','{"full_name":"Owner B"}');
insert into public.companies(id,name,company_template) values
('20000000-0000-4000-8000-000000000001','RLS Company A','generic'),
('20000000-0000-4000-8000-000000000002','RLS Company B','generic');
insert into public.memberships(company_id,user_id,role) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner'),
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','member'),
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','admin'),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000004','owner');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
insert into public.company_branding(company_id,accent_color)
values('20000000-0000-4000-8000-000000000001','#216f78');
do $$
begin
  if (select accent_color from public.company_branding where company_id='20000000-0000-4000-8000-000000000001') <> '#216f78' then
    raise exception 'Owner A write/read failed';
  end if;
  if exists(select 1 from public.companies where id='20000000-0000-4000-8000-000000000002') then
    raise exception 'Owner A can see company B';
  end if;
  begin
    insert into public.company_branding(company_id,accent_color)
    values('20000000-0000-4000-8000-000000000002','#2457a5');
    raise exception 'Owner A wrote branding for company B';
  exception when insufficient_privilege then null;
  end;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$
declare changed integer;
begin
  if (select accent_color from public.company_branding where company_id='20000000-0000-4000-8000-000000000001') <> '#216f78' then
    raise exception 'Member A cannot read own company';
  end if;
  update public.company_branding set accent_color='#8f3e5c'
    where company_id='20000000-0000-4000-8000-000000000001';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Member A updated branding'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
update public.company_branding set accent_color='#216d51'
where company_id='20000000-0000-4000-8000-000000000001';
do $$ begin
  if (select accent_color from public.company_branding where company_id='20000000-0000-4000-8000-000000000001') <> '#216d51' then
    raise exception 'Admin A update failed';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000004',true);
insert into public.company_branding(company_id,accent_color)
values('20000000-0000-4000-8000-000000000002','#684c95');
do $$ begin
  if (select count(*) from public.company_branding) <> 1
     or exists(select 1 from public.company_branding where company_id='20000000-0000-4000-8000-000000000001') then
    raise exception 'Owner B can read company A branding';
  end if;
end $$;
commit;
