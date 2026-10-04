import { NextResponse } from "next/server";

const phonePattern = /(?:\+?\d[\d ()-]{7,}\d)/;

function clean(value: string, max: number) {
  return value.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const title = clean(String(form.get("title") || ""), 120);
  const text = clean(String(form.get("text") || form.get("url") || ""), 1000);
  const combined = `${title} ${text}`;
  const phone = combined.match(phonePattern)?.[0]?.replace(/[^\d+]/g, "").slice(0, 40) || "";
  const vcardName = text.match(/(?:FN|N):\s*([^;\n]+)/i)?.[1] || "";
  const name = clean(vcardName || title || text.split(/[\n,|]/)[0] || "Contato do WhatsApp", 120);
  const params = new URLSearchParams({ capture: "1", source: "WhatsApp mobile" });
  if (name) params.set("name", name);
  if (phone) params.set("phone", phone);
  // Redirect fragments keep shared contact data out of ordinary request logs.
  return NextResponse.redirect(new URL(`/capturar#${params.toString()}`, request.url), 303);
}
