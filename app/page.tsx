import { createClient } from "@/lib/supabase/server";
import LandingPage from "./landing-page";
import WorkspacePage from "./workspace-page";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { view } = await searchParams;
  const initialTab = view === "pipeline" || view === "list" ? view : "today";
  return user ? <WorkspacePage initialTab={initialTab} /> : <LandingPage />;
}
