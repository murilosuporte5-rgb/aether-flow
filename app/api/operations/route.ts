import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";

const fail = (error: string, status = 400) => Response.json({ error }, { status });
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function context(companyId: string) {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  const { data: membership, error } = await s.from("memberships").select("company_id,role").eq("company_id", companyId).eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!membership) return null;
  return { s, user, role: membership.role as string, companyId };
}

export async function GET(request: Request) {
  try {
    const companyId = new URL(request.url).searchParams.get("companyId") || "";
    if (!/^[0-9a-f-]{36}$/i.test(companyId)) return fail("Empresa inválida.");
    const ctx = await context(companyId);
    if (!ctx) return fail("Empresa não autorizada.", 403);
    const [categories, suppliers, products, movements] = await Promise.all([
      ctx.s.from("operation_categories").select("id,name").eq("company_id", companyId).order("name"),
      ctx.s.from("operation_suppliers").select("id,name,contact").eq("company_id", companyId).order("name"),
      ctx.s.from("operation_products").select("id,name,sku,status,value,quantity,category_id,supplier_id,owner_id,created_at,updated_at").eq("company_id", companyId).order("updated_at", { ascending: false }),
      ctx.s.from("operation_movements").select("id,product_id,type,quantity,note,actor_id,created_at").eq("company_id", companyId).order("created_at", { ascending: false }).limit(100),
    ]);
    for (const result of [categories, suppliers, products, movements]) if (result.error) throw result.error;
    return Response.json({ categories: categories.data || [], suppliers: suppliers.data || [], products: products.data || [], movements: movements.data || [], canManage: ctx.role === "owner" || ctx.role === "manager" });
  } catch (error) {
    console.error("operations GET", { type: error instanceof Error ? error.name : "unknown" });
    return fail("Não foi possível carregar a operação.", 500);
  }
}

export async function POST(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  try {
    const body = await request.json() as Record<string, unknown>;
    const companyId = text(body.companyId, 80);
    if (!/^[0-9a-f-]{36}$/i.test(companyId)) return fail("Empresa inválida.");
    const ctx = await context(companyId);
    if (!ctx) return fail("Empresa não autorizada.", 403);
    if (!['owner', 'manager'].includes(ctx.role)) return fail("Gestor da empresa requerido.", 403);
    if (body.kind === "movement") {
      const productId = text(body.productId, 80), type = text(body.type, 10);
      const quantity = Number(body.quantity);
      if (!/^[0-9a-f-]{36}$/i.test(productId) || !['entry', 'exit'].includes(type) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return fail("Movimentação inválida.");
      const { data, error } = await ctx.s.rpc("apply_operation_movement", { p_company_id: companyId, p_product_id: productId, p_type: type, p_quantity: quantity, p_note: text(body.note, 500) || null });
      if (error) return fail(error.code === "42501" ? error.message : error.code === "P0001" ? error.message : "Não foi possível registrar a movimentação.", error.code === "42501" ? 403 : 400);
      return Response.json(data);
    }
    if (body.kind === "product") {
      const name = text(body.name, 160), sku = text(body.sku, 80) || null;
      const value = Number(body.value || 0), quantity = Number(body.quantity || 0);
      if (name.length < 1 || !Number.isFinite(value) || value < 0 || !Number.isInteger(quantity) || quantity < 0) return fail("Produto inválido.");
      const { data, error } = await ctx.s.from("operation_products").insert({ company_id: companyId, name, sku, value, quantity, owner_id: ctx.user.id, category_id: text(body.categoryId, 80) || null, supplier_id: text(body.supplierId, 80) || null }).select("*").single();
      if (error) return fail(error.code === "42501" ? "Gestor da empresa requerido." : "Não foi possível criar o produto.", error.code === "42501" ? 403 : 400);
      return Response.json({ ok: true, product: data });
    }
    return fail("Operação inválida.");
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Dados inválidos.");
    console.error("operations POST", { type: error instanceof Error ? error.name : "unknown" });
    return fail("Não foi possível concluir a operação.", 500);
  }
}
