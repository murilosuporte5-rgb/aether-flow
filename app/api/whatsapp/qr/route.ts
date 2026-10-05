import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeWhatsAppAttempt } from "@/lib/whatsapp-rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const attempt = consumeWhatsAppAttempt(`qr:${user.id}`);
  if (!attempt.allowed) return NextResponse.json({ error: `Aguarde ${attempt.retryAfter}s antes de gerar outro QR Code.` }, { status: 429, headers: { "Retry-After": String(attempt.retryAfter) } });
  const bridge = process.env.WPP_BRIDGE_URL?.trim().replace(/\/$/, "");
  const token = process.env.WPP_BRIDGE_TOKEN?.trim();
  const evolution = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const evolutionKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!bridge || !token) {
    if (!evolution || !evolutionKey) return NextResponse.json({ error: "O conector QR ainda não foi instalado no servidor." }, { status: 503 });
    const instance = `aether_qr_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}_${Date.now().toString(36)}`;
    const headers = { "Content-Type": "application/json", apikey: evolutionKey };
    const webhookSecret = process.env.EVOLUTION_WEBHOOK_SECRET?.trim() || evolutionKey;
    const webhook = { url: `${new URL(request.url).origin}/api/webhooks/evolution`, byEvents: false, base64: false, headers: [{ name: "x-aether-webhook-secret", value: webhookSecret }], events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"] };
    try {
      const signal = AbortSignal.timeout(12000);
      const create = await fetch(`${evolution}/instance/create`, { method: "POST", headers, body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: true, webhook }), signal });
      if (!create.ok && create.status !== 409 && create.status !== 403) return NextResponse.json({ error: "Não foi possível preparar o QR Code." }, { status: 502 });
      const connect = await fetch(`${evolution}/instance/connect/${encodeURIComponent(instance)}`, { headers, cache: "no-store", signal });
      const payload = await connect.json().catch(() => ({}));
      if (!connect.ok) return NextResponse.json({ error: "A Evolution não retornou o QR Code.", details: payload?.message }, { status: 502 });
      const { data: membership } = await supabase.from("memberships").select("company_id").eq("user_id", user.id).limit(1).maybeSingle();
      if (membership?.company_id) await supabase.from("whatsapp_connections").insert({ company_id: membership.company_id, user_id: user.id, instance_name: instance, status: "connecting" });
      return NextResponse.json({ ...payload, session: instance, qrCode: payload?.base64 || payload?.qrcode?.base64 || payload?.qrcode });
    } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
  }
  const session = `aether_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 28)}`;
  try {
    const upstream = await fetch(`${bridge}/api/${session}/start-session`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await upstream.json().catch(() => ({}));
    return NextResponse.json({ ...payload, session }, { status: upstream.ok ? 200 : 502 });
  } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
}

