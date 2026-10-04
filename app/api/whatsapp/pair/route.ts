import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function cleanPhone(value: unknown) {
  return typeof value === "string" ? value.replace(/\D/g, "").slice(0, 15) : "";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const base = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!base || !apiKey) return NextResponse.json({ error: "O conector móvel ainda não foi instalado no servidor." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const phone = cleanPhone(body.phone);
  if (phone.length < 10 || phone.length > 15) return NextResponse.json({ error: "Informe o telefone com DDD e código do país. Ex.: 5571999999999" }, { status: 400 });
  const instance = `aether_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18)}_${Date.now().toString(36)}`;
  const headers = { "Content-Type": "application/json", apikey: apiKey };
  try {
    const create = await fetch(`${base}/instance/create`, { method: "POST", headers, body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: false }) });
    // Evolution returns 403 when the account instance already exists; that is
    // safe to continue with because the next call reconnects that instance.
    if (!create.ok && create.status !== 409 && create.status !== 403) {
      console.error("Evolution instance/create failed", create.status, await create.text().catch(() => ""));
      return NextResponse.json({ error: "Não foi possível preparar sua sessão WhatsApp." }, { status: 502 });
    }
    let connect = await fetch(`${base}/instance/connect/${encodeURIComponent(instance)}?number=${encodeURIComponent(phone)}`, { headers, cache: "no-store" });
    let payload = await connect.json().catch(() => ({}));
    if (!connect.ok || typeof payload.pairingCode !== "string") {
      await fetch(`${base}/instance/delete/${encodeURIComponent(instance)}`, { method: "DELETE", headers }).catch(() => undefined);
      const recreate = await fetch(`${base}/instance/create`, { method: "POST", headers, body: JSON.stringify({ instanceName: instance, integration: "WHATSAPP-BAILEYS", qrcode: false }) });
      if (recreate.ok || recreate.status === 409) {
        connect = await fetch(`${base}/instance/connect/${encodeURIComponent(instance)}?number=${encodeURIComponent(phone)}`, { headers, cache: "no-store" });
        payload = await connect.json().catch(() => ({}));
      }
    }
    if (!connect.ok || typeof payload.pairingCode !== "string") {
      console.error("Evolution instance/connect failed", connect.status, JSON.stringify(payload));
      return NextResponse.json({ error: "O servidor não retornou um código de pareamento. Tente gerar novamente." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, pairingCode: payload.pairingCode, instance });
  } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
}

