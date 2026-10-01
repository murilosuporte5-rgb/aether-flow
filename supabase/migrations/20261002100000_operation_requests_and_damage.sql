alter table public.operation_movements drop constraint if exists operation_movements_type_check;
alter table public.operation_movements add constraint operation_movements_type_check check (type in ('entry','exit','damage'));

create table public.operation_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null,
  requested_by uuid not null,
  quantity integer not null check (quantity > 0 and quantity <= 100000),
  note text,
  status text not null default 'open' check (status in ('open','fulfilled','cancelled')),
  created_at timestamptz not null default now(),
  foreign key(company_id, product_id) references public.operation_products(company_id, id),
  foreign key(company_id, requested_by) references public.memberships(company_id, user_id)
);
alter table public.operation_requests enable row level security;
create policy operation_requests_read on public.operation_requests for select to authenticated using(private.is_company_member(company_id));
create policy operation_requests_write on public.operation_requests for insert to authenticated with check(private.is_company_manager(company_id) and requested_by=(select auth.uid()));
create policy operation_requests_update on public.operation_requests for update to authenticated using(private.is_company_manager(company_id)) with check(private.is_company_manager(company_id));
grant select,insert,update on public.operation_requests to authenticated;
create index operation_requests_company_created on public.operation_requests(company_id, created_at desc);

create or replace function public.apply_operation_movement(p_company_id uuid,p_product_id uuid,p_type text,p_quantity integer,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); product public.operation_products%rowtype; next_quantity integer;
begin
 if actor is null or not private.is_company_manager(p_company_id) then raise exception using errcode='42501',message='Gestor da empresa requerido.'; end if;
 if p_type not in ('entry','exit','damage') or p_quantity is null or p_quantity<=0 or p_quantity>100000 then raise exception 'Movimentação inválida.'; end if;
 select * into product from public.operation_products where company_id=p_company_id and id=p_product_id for update;
 if not found then raise exception 'Produto não encontrado.'; end if;
 next_quantity:=case when p_type='entry' then product.quantity+p_quantity else product.quantity-p_quantity end;
 if next_quantity<0 then raise exception 'A saída supera o saldo disponível.'; end if;
 update public.operation_products set quantity=next_quantity,status=case when next_quantity<=minimum_quantity then 'attention' else status end where company_id=p_company_id and id=p_product_id;
 insert into public.operation_movements(company_id,product_id,actor_id,type,quantity,note) values(p_company_id,p_product_id,actor,p_type,p_quantity,left(nullif(trim(p_note),''),500));
 return jsonb_build_object('ok',true,'quantity',next_quantity);
end $$;
revoke all on function public.apply_operation_movement(uuid,uuid,text,integer,text) from public,anon;
grant execute on function public.apply_operation_movement(uuid,uuid,text,integer,text) to authenticated;
