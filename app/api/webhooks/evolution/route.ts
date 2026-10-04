import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const digits = (value: unknown) => typeof value === "string" ? value.replace(/\D/g, "") : "";
const text = (value: unknown, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET?.trim() || process.env.EVOLUTION_API_KEY?.trim();
  const supplied = request.headers.get("x-aether-webhook-secret") || request.headers.get("apikey");
  if (!expected || supplied !== expected) return NextResponse.json({ error: "Assinatura inválida." }, { status: 403 });
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  const event = text(payload.event, 80).toUpperCase();
  if (!event.includes("MESSAGE")) return NextResponse.json({ ok: true, ignored: true });
  const instance = text(payload.instance || (payload.data as Record<string, unknown> | null)?.instance, 120);
  const data = (payload.data || {}) as Record<string, unknown>;
  const key = (data.key || {}) as Record<string, unknown>;
  const remoteJid = text(key.remoteJid || data.remoteJid, 120);
  const phone = digits(remoteJid.split("@")[0] || data.phone);
  if (!instance || !phone || remoteJid.endsWith("@g.us")) return NextResponse.json({ ok: true, ignored: true });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada." }, { status: 503 });
  const { data: connection } = await admin.from("whatsapp_connections").select("company_id,user_id").eq("instance_name", instance).maybeSingle();
  if (!connection) return NextResponse.json({ error: "Instância não vinculada." }, { status: 404 });
  const message = (data.message || {}) as Record<string, unknown>;
  const conversation = text(message.conversation || (message.extendedTextMessage as Record<string, unknown> | null)?.text || data.body, 500);
  const senderName = text(data.pushName || data.verifiedBizName || `WhatsApp ${phone.slice(-4)}`, 100);
  const normalized = phone.startsWith("55") ? `+${phone}` : `+55${phone}`;
  const { data: existing } = await admin.from("contacts").select("id,name").eq("company_id", connection.company_id).eq("phone", normalized).maybeSingle();
  let contactId = existing?.id;
  if (!contactId) {
    const inserted = await admin.from("contacts").insert({ company_id: connection.company_id, name: senderName, phone: normalized }).select("id").single();
    if (inserted.error) return NextResponse.json({ error: "Não foi possível criar o contato." }, { status: 500 });
    contactId = inserted.data.id;
  }
  const { data: openOpportunity } = await admin.from("opportunities").select("id").eq("company_id", connection.company_id).eq("contact_id", contactId).eq("status", "open").maybeSingle();
  if (openOpportunity?.id) {
    await admin.from("opportunities").update({ last_interaction_at: new Date().toISOString(), details: conversation || undefined }).eq("id", openOpportunity.id).eq("company_id", connection.company_id);
  } else {
    const { data: stage } = await admin.from("pipeline_stages").select("id").eq("company_id", connection.company_id).eq("kind", "open").order("position", { ascending: true }).limit(1).maybeSingle();
    if (!stage) return NextResponse.json({ error: "A empresa ainda não tem uma etapa aberta." }, { status: 409 });
    const created = await admin.from("opportunities").insert({ company_id: connection.company_id, contact_id: contactId, title: `WhatsApp · ${senderName}`, stage_id: stage.id, owner_id: connection.user_id, status: "open", source: "WhatsApp", details: conversation || "Lead recebido automaticamente pela Evolution.", last_interaction_at: new Date().toISOString() }).select("id").single();
    if (created.error) return NextResponse.json({ error: "Não foi possível criar a oportunidade." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, contactId });
}
