import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workspace from "./workspace";
import Onboarding from "./onboarding";
import { isAetherAdmin } from "@/lib/provision";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  initialTab = "today",
}: {
  initialTab?: "today" | "list" | "pipeline" | "contacts";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await isAetherAdmin(supabase, user.id);
  const { data: memberships, error } = await supabase
    .from("memberships")
    .select("company_id,companies(is_demo)")
    .eq("user_id", user.id);

  if (error) throw error;
  const hasRealCompany = (memberships || []).some((m) => {
    const c = Array.isArray(m.companies) ? m.companies[0] : m.companies;
    return c && !c.is_demo;
  });

  if (!hasRealCompany)
    return <Onboarding email={user.email || ""} adminAccess={admin} />;

  return (
    <Workspace
      user={{
        name: user.user_metadata?.full_name || user.email || "Usuário",
        email: user.email || "",
      }}
      signOut="/auth/signout"
      adminAccess={admin}
      initialTab={initialTab}
    />
  );
}
