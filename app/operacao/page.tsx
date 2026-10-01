import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Operations from "./operations";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <Operations userName={user.user_metadata?.full_name || user.email || "Usuário"} />;
}
