create table public.operation_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  unique(company_id, name),
  unique(company_id, id)
);

create table public.operation_suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  contact text,
  created_at timestamptz not null default now(),
  unique(company_id, id)
);

create table public.operation_products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category_id uuid,
  supplier_id uuid,
  owner_id uuid not null,
  name text not null check (length(trim(name)) between 1 and 160),
  sku text check (sku is null or length(trim(sku)) between 1 and 80),
  status text not null default 'active' check (status in ('active','attention','inactive')),
  value numeric(14,2) not null default 0 check (value >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, id),
  foreign key(company_id, category_id) references public.operation_categories(company_id, id),
  foreign key(company_id, supplier_id) references public.operation_suppliers(company_id, id),
  foreign key(company_id, owner_id) references public.memberships(company_id, user_id)
);

create table public.operation_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null,
  actor_id uuid not null,
  type text not null check (type in ('entry','exit')),
  quantity integer not null check (quantity > 0),
  note text,
  created_at timestamptz not null default now(),
  foreign key(company_id, product_id) references public.operation_products(company_id, id),
  foreign key(company_id, actor_id) references public.memberships(company_id, user_id)
);

alter table public.operation_categories enable row level security;
alter table public.operation_suppliers enable row level security;
alter table public.operation_products enable row level security;
alter table public.operation_movements enable row level security;

create function private.is_company_manager(p_company_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.memberships where company_id=p_company_id and user_id=(select auth.uid()) and role in ('owner','manager'));
$$;
revoke all on function private.is_company_manager(uuid) from public,anon;
grant execute on function private.is_company_manager(uuid) to authenticated;

create policy operation_categories_read on public.operation_categories for select to authenticated using(private.is_company_member(company_id));
create policy operation_categories_write on public.operation_categories for all to authenticated using(private.is_company_manager(company_id)) with check(private.is_company_manager(company_id));
create policy operation_suppliers_read on public.operation_suppliers for select to authenticated using(private.is_company_member(company_id));
create policy operation_suppliers_write on public.operation_suppliers for all to authenticated using(private.is_company_manager(company_id)) with check(private.is_company_manager(company_id));
create policy operation_products_read on public.operation_products for select to authenticated using(private.is_company_member(company_id));
create policy operation_products_write on public.operation_products for all to authenticated using(private.is_company_manager(company_id)) with check(private.is_company_manager(company_id));
create policy operation_movements_read on public.operation_movements for select to authenticated using(private.is_company_member(company_id));
create policy operation_movements_write on public.operation_movements for insert to authenticated with check(private.is_company_manager(company_id) and actor_id=(select auth.uid()));

grant select on public.operation_categories,public.operation_suppliers,public.operation_products,public.operation_movements to authenticated;
grant insert,update,delete on public.operation_categories,public.operation_suppliers,public.operation_products to authenticated;
grant insert on public.operation_movements to authenticated;

create index operation_products_company_updated on public.operation_products(company_id, updated_at desc);
create index operation_movements_company_created on public.operation_movements(company_id, created_at desc);

create function private.stamp_operation_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at:=statement_timestamp(); return new; end $$;
revoke all on function private.stamp_operation_updated_at() from public,anon,authenticated;
create trigger operation_products_updated before update on public.operation_products for each row execute function private.stamp_operation_updated_at();

create function public.apply_operation_movement(p_company_id uuid,p_product_id uuid,p_type text,p_quantity integer,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); product public.operation_products%rowtype; next_quantity integer;
begin
 if actor is null or not private.is_company_manager(p_company_id) then raise exception using errcode='42501',message='Gestor da empresa requerido.'; end if;
 if p_type not in ('entry','exit') or p_quantity is null or p_quantity<=0 or p_quantity>100000 then raise exception 'Movimentação inválida.'; end if;
 select * into product from public.operation_products where company_id=p_company_id and id=p_product_id for update;
 if not found then raise exception 'Produto não encontrado.'; end if;
 next_quantity:=case when p_type='entry' then product.quantity+p_quantity else product.quantity-p_quantity end;
 if next_quantity<0 then raise exception 'A saída supera o saldo disponível.'; end if;
 update public.operation_products set quantity=next_quantity,status=case when next_quantity=0 then 'attention' else status end where company_id=p_company_id and id=p_product_id;
 insert into public.operation_movements(company_id,product_id,actor_id,type,quantity,note) values(p_company_id,p_product_id,actor,p_type,p_quantity,left(nullif(trim(p_note),''),500));
 return jsonb_build_object('ok',true,'quantity',next_quantity);
end $$;
revoke all on function public.apply_operation_movement(uuid,uuid,text,integer,text) from public,anon;
grant execute on function public.apply_operation_movement(uuid,uuid,text,integer,text) to authenticated;
