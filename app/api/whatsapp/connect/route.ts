import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401 });
  const appSecret = process.env.META_APP_SECRET?.trim();
  const appId = process.env.META_APP_ID?.trim();
  if (!appId || !appSecret) {
    return NextResponse.json({ error: "A integração oficial ainda aguarda as credenciais da Meta." }, { status: 503 });
  }
  const body = await request.json().catch(() => ({}));
  if (typeof body.code !== "string" || body.code.length < 12 || body.code.length > 4096) {
    return NextResponse.json({ error: "Código de autorização inválido." }, { status: 400 });
  }
  // The code exchange is intentionally kept server-side. It is enabled after the
  // Meta app is configured and reviewed, so no app secret reaches the browser.
  return NextResponse.json({ error: "A conexão foi iniciada, mas o servidor ainda não recebeu a configuração completa da Meta." }, { status: 503 });
}

