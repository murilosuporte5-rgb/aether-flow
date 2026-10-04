import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WhatsAppConnect from "./whatsapp-connect";

export const dynamic = "force-dynamic";

export default async function WhatsAppIntegrationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <main className="whatsapp-integration-page"><WhatsAppConnect /></main>;
}

