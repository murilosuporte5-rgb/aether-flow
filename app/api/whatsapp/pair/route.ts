import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/execution";
import { consumeWhatsAppAttempt } from "@/lib/whatsapp-rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const attempt = consumeWhatsAppAttempt(`pair:${user.id}`);
  if (!attempt.allowed) return NextResponse.json({ error: `Aguarde ${attempt.retryAfter}s antes de gerar outro código.` }, { status: 429, headers: { "Retry-After": String(attempt.retryAfter) } });
  const base = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!base || !apiKey) return NextResponse.json({ error: "O conector móvel ainda não foi instalado no servidor." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const phone = normalizePhone(typeof body.phone === "string" ? body.phone : null);
  if (!phone || !phone.startsWith("55")) return NextResponse.json({ error: "Informe um celular brasileiro válido com DDD e código do país. Ex.: 5571999999999" }, { status: 400 });
  const instance = `aether_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}_${Date.now().toString(36)}`;
  const headers = { "Content-Type": "application/json", apikey: apiKey };
  const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET?.trim() || apiKey;
  const webhook = { url: `${new URL(request.url).origin}/api/webhooks/evolution`, byEvents: false, base64: false, headers: [{ name: "x-aether-webhook-secret", value: webhookSecret }], events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"] };
  try {
    const signal = AbortSignal.timeout(12000);
    const create = await fetch(`${base}/instance/create`, { method: "POST", headers, body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: false, webhook }), signal });
    // Evolution returns 403 when the account instance already exists; that is
    // safe to continue with because the next call reconnects that instance.
    if (!create.ok && create.status !== 409 && create.status !== 403) {
      console.error("Evolution instance/create failed", create.status, await create.text().catch(() => ""));
      return NextResponse.json({ error: "Não foi possível preparar sua sessão WhatsApp." }, { status: 502 });
    }
    let connect = await fetch(`${base}/instance/connect/${encodeURIComponent(instance)}?number=${encodeURIComponent(phone)}`, { headers, cache: "no-store", signal });
    let payload = await connect.json().catch(() => ({}));
    if (!connect.ok || typeof payload.pairingCode !== "string") {
      // Evolution 2.3.x can fail to produce a phone pairing code. Keep the
      // user moving by falling back to a QR session instead of ending here.
      await fetch(`${base}/instance/delete/${encodeURIComponent(instance)}`, { method: "DELETE", headers }).catch(() => undefined);
      const recreate = await fetch(`${base}/instance/create`, { method: "POST", headers, body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: true, webhook }), signal });
      if (recreate.ok || recreate.status === 409) {
        connect = await fetch(`${base}/instance/connect/${encodeURIComponent(instance)}`, { headers, cache: "no-store", signal });
        payload = await connect.json().catch(() => ({}));
      }
      const qrCode = payload?.base64 || payload?.qrcode?.base64 || payload?.qrcode;
      if (connect.ok && typeof qrCode === "string" && qrCode.length > 20) {
        const { data: membership } = await supabase.from("memberships").select("company_id").eq("user_id", user.id).limit(1).maybeSingle();
        if (membership?.company_id) await supabase.from("whatsapp_connections").insert({ company_id: membership.company_id, user_id: user.id, instance_name: instance, phone: `+${phone}`, status: "connecting" });
        return NextResponse.json({ ok: true, instance, mode: "qr", qrCode });
      }
    }
    if (!connect.ok || typeof payload.pairingCode !== "string") {
      console.error("Evolution instance/connect failed", connect.status, JSON.stringify(payload));
      return NextResponse.json({ error: "O servidor não retornou pareamento nem QR Code. Tente gerar novamente." }, { status: 502 });
    }
    const { data: membership } = await supabase.from("memberships").select("company_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (membership?.company_id) await supabase.from("whatsapp_connections").insert({ company_id: membership.company_id, user_id: user.id, instance_name: instance, phone: `+${phone}`, status: "connecting" });
    return NextResponse.json({ ok: true, pairingCode: payload.pairingCode, instance });
  } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
}

