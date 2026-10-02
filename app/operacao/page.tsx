import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Operations from "./operations";
import { ArrowLeft, LogOut } from "lucide-react";
import { AetherMark } from "../aether-logo";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="operations-screen"><header className="operations-app-bar"><a className="operations-brand" href="/"><AetherMark size={34}/><span><strong>Aether Flow</strong><small>OPERAÇÃO</small></span></a><nav aria-label="Ações da operação"><a href="/"><ArrowLeft size={16}/> Voltar ao painel</a><a href="/auth/signout"><LogOut size={16}/> Sair</a></nav></header><Operations userName={user.user_metadata?.full_name || user.email || "Usuário"} /></div>;
}
