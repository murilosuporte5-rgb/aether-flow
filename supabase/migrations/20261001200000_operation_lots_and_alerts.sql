alter table public.operation_products
  add column lot_code text check (lot_code is null or length(trim(lot_code)) between 1 and 80),
  add column expires_at date,
  add column minimum_quantity integer not null default 0 check (minimum_quantity >= 0);

create index operation_products_company_expiry on public.operation_products(company_id, expires_at);

create or replace function public.apply_operation_movement(p_company_id uuid,p_product_id uuid,p_type text,p_quantity integer,p_note text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); product public.operation_products%rowtype; next_quantity integer;
begin
 if actor is null or not private.is_company_manager(p_company_id) then raise exception using errcode='42501',message='Gestor da empresa requerido.'; end if;
 if p_type not in ('entry','exit') or p_quantity is null or p_quantity<=0 or p_quantity>100000 then raise exception 'Movimentação inválida.'; end if;
 select * into product from public.operation_products where company_id=p_company_id and id=p_product_id for update;
 if not found then raise exception 'Produto não encontrado.'; end if;
 next_quantity:=case when p_type='entry' then product.quantity+p_quantity else product.quantity-p_quantity end;
 if next_quantity<0 then raise exception 'A saída supera o saldo disponível.'; end if;
 update public.operation_products set quantity=next_quantity,status=case when next_quantity<=minimum_quantity or (expires_at is not null and expires_at<=current_date+30) then 'attention' else status end where company_id=p_company_id and id=p_product_id;
 insert into public.operation_movements(company_id,product_id,actor_id,type,quantity,note) values(p_company_id,p_product_id,actor,p_type,p_quantity,left(nullif(trim(p_note),''),500));
 return jsonb_build_object('ok',true,'quantity',next_quantity);
end $$;
