import { verifyMetaSignature } from "@/lib/whatsapp-webhook";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && challenge && token === process.env.META_WEBHOOK_VERIFY_TOKEN?.trim()) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return Response.json({ error: "Verificação recusada." }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyMetaSignature(rawBody, request.headers.get("x-hub-signature-256"), process.env.META_APP_SECRET?.trim())) {
    return Response.json({ error: "Assinatura inválida." }, { status: 403 });
  }
  try {
    JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Payload inválido." }, { status: 400 });
  }
  return Response.json({ ok: true });
}

