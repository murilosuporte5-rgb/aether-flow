import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const base = process.env.EVOLUTION_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  const instance = new URL(request.url).searchParams.get("instance")?.trim();
  if (!base || !apiKey) return NextResponse.json({ error: "Conector não configurado." }, { status: 503 });
  const userPrefix = user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 18);
  const validPrefix = instance?.startsWith(`aether_${userPrefix}_`) || instance?.startsWith(`aether_qr_${userPrefix}_`);
  if (!instance || !validPrefix || !/^aether_(?:qr_)?[a-zA-Z0-9]+_[a-z0-9]+$/.test(instance)) return NextResponse.json({ error: "Sessão inválida." }, { status: 400 });
  try {
    const response = await fetch(`${base}/instance/connectionState/${encodeURIComponent(instance)}`, { headers: { apikey: apiKey }, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ state: "close", error: payload?.message || "Não foi possível consultar a sessão." }, { status: 502 });
    const state = String(payload?.instance?.state || payload?.state || "connecting").toLowerCase();
    const normalized = state === "open" || state === "connected" ? "open" : state === "close" || state === "closed" ? "close" : "connecting";
    await supabase.from("whatsapp_connections").update({ status: normalized, updated_at: new Date().toISOString() }).eq("instance_name", instance);
    return NextResponse.json({ state: normalized });
  } catch { return NextResponse.json({ state: "connecting", error: "Conector indisponível." }, { status: 502 }); }
}
