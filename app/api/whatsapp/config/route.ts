import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID?.trim() || "";
  const configId = process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() || "";
  return NextResponse.json({ configured: Boolean(appId && configId), appId, configId, qrConfigured: Boolean(process.env.WPP_BRIDGE_URL?.trim() && process.env.WPP_BRIDGE_TOKEN?.trim()) });
}

