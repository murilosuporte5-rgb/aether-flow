import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ status: "unauthenticated" }, { status: 401 });
  const { data: connections } = await supabase
    .from("whatsapp_connections")
    .select("instance_name,status,updated_at,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const connection = connections?.find((item) => item.status === "open") || connections?.[0];
  if (!connection) return NextResponse.json({ status: "not_configured" });
  const base = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  let status = connection.status as "connecting" | "open" | "close";
  if (base && apiKey) {
    try {
      const response = await fetch(`${base}/instance/connectionState/${encodeURIComponent(connection.instance_name)}`, { headers: { apikey: apiKey }, cache: "no-store", signal: AbortSignal.timeout(5000) });
      const payload = await response.json().catch(() => ({}));
      if (response.ok) {
        const raw = String(payload?.instance?.state || payload?.state || status).toLowerCase();
        status = raw === "open" || raw === "connected" ? "open" : raw === "close" || raw === "closed" ? "close" : "connecting";
        if (status !== connection.status) await supabase.from("whatsapp_connections").update({ status, updated_at: new Date().toISOString() }).eq("instance_name", connection.instance_name);
      }
    } catch { /* preserve the last known status during a transient outage */ }
  }
  return NextResponse.json({ status, updatedAt: connection.updated_at, instance: connection.instance_name });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const { data: connection, error: lookupError } = await supabase
    .from("whatsapp_connections")
    .select("id,instance_name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Não foi possível localizar a conexão." }, { status: 500 });
  if (!connection) return NextResponse.json({ status: "not_configured" });
  const base = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  if (!base || !apiKey) return NextResponse.json({ error: "O conector WhatsApp não está configurado no servidor." }, { status: 503 });
  try {
    const response = await fetch(`${base}/instance/logout/${encodeURIComponent(connection.instance_name)}`, { method: "DELETE", headers: { apikey: apiKey }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok && response.status !== 404) return NextResponse.json({ error: "Não foi possível desconectar o WhatsApp." }, { status: 502 });
    await supabase.from("whatsapp_connections").update({ status: "close", updated_at: new Date().toISOString() }).eq("id", connection.id);
    return NextResponse.json({ ok: true, status: "close" });
  } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
}
