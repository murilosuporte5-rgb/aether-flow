import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const bridge = process.env.WPP_BRIDGE_URL?.trim().replace(/\/$/, "");
  const token = process.env.WPP_BRIDGE_TOKEN?.trim();
  if (!bridge || !token) return NextResponse.json({ error: "O conector QR ainda não foi instalado no servidor." }, { status: 503 });
  const session = `aether_${user.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 28)}`;
  try {
    const upstream = await fetch(`${bridge}/api/${session}/start-session`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await upstream.json().catch(() => ({}));
    return NextResponse.json({ ...payload, session }, { status: upstream.ok ? 200 : 502 });
  } catch { return NextResponse.json({ error: "Não foi possível alcançar o conector WhatsApp." }, { status: 502 }); }
}

