import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const digits = (value: unknown) => typeof value === "string" ? value.replace(/\D/g, "") : "";
const text = (value: unknown, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";
const appendConversation = (previous: unknown, next: string) => {
  const oldValue = typeof previous === "string" ? previous.trim() : "";
  if (!next) return oldValue.slice(-4000);
  const stamp = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Bahia",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
  return `${oldValue ? `${oldValue}\n` : ""}[${stamp}] ${next}`.slice(-4000);
};

export async function POST(request: Request) {
  const expected = process.env.EVOLUTION_WEBHOOK_SECRET?.trim() || process.env.EVOLUTION_API_KEY?.trim();
  const supplied = request.headers.get("x-aether-webhook-secret") || request.headers.get("apikey");
  if (!expected || supplied !== expected) return NextResponse.json({ error: "Assinatura inválida." }, { status: 403 });
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  const event = text(payload.event, 80).toUpperCase();
  const data = (payload.data || {}) as Record<string, unknown>;
  const instance = text(payload.instance || data.instance, 120);
  if (!event.includes("MESSAGE") && !event.includes("CONNECTION")) return NextResponse.json({ ok: true, ignored: true });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY não configurada." }, { status: 503 });
  if (event.includes("CONNECTION")) {
    if (!instance) return NextResponse.json({ ok: true, ignored: true });
    const rawState = text(data.state || data.status || (data.data as Record<string, unknown> | null)?.state, 40).toLowerCase();
    const status = rawState === "open" || rawState === "connected" ? "open" : rawState === "close" || rawState === "closed" ? "close" : "connecting";
    await admin.from("whatsapp_connections").update({ status, updated_at: new Date().toISOString() }).eq("instance_name", instance);
    return NextResponse.json({ ok: true, status });
  }
  const key = (data.key || {}) as Record<string, unknown>;
  if (key.fromMe === true) return NextResponse.json({ ok: true, ignored: true });
  const remoteJid = text(key.remoteJid || data.remoteJid, 120);
  const phone = digits(remoteJid.split("@")[0] || data.phone);
  if (!instance || !phone || remoteJid.endsWith("@g.us")) return NextResponse.json({ ok: true, ignored: true });
  const { data: connection } = await admin.from("whatsapp_connections").select("id,company_id,user_id").eq("instance_name", instance).maybeSingle();
  if (!connection) return NextResponse.json({ error: "Instância não vinculada." }, { status: 404 });
  const message = (data.message || {}) as Record<string, unknown>;
  const conversation = text(message.conversation || (message.extendedTextMessage as Record<string, unknown> | null)?.text || data.body, 500);
  const senderName = text(data.pushName || data.verifiedBizName || `WhatsApp ${phone.slice(-4)}`, 100);
  const normalized = phone.startsWith("55") ? `+${phone}` : `+55${phone}`;
  const { data: pending } = await admin.from("whatsapp_captures").select("id,conversation").eq("company_id", connection.company_id).eq("phone", normalized).eq("status", "pending").maybeSingle();
  if (pending?.id) {
    const updated = await admin.from("whatsapp_captures").update({ name: senderName, conversation: appendConversation(pending.conversation, conversation), created_at: new Date().toISOString() }).eq("id", pending.id);
    if (updated.error) return NextResponse.json({ error: "Não foi possível atualizar a captura." }, { status: 500 });
    return NextResponse.json({ ok: true, queued: true, captureId: pending.id });
  }
  const created = await admin.from("whatsapp_captures").insert({ company_id: connection.company_id, connection_id: connection.id, name: senderName, phone: normalized, conversation, source: "WhatsApp automático", status: "pending" }).select("id").single();
  if (created.error) return NextResponse.json({ error: "Não foi possível registrar a captura." }, { status: 500 });
  return NextResponse.json({ ok: true, queued: true, captureId: created.data.id });
}
