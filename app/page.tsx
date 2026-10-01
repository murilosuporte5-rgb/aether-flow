import { createClient } from "@/lib/supabase/server";
import LandingPage from "./landing-page";
import WorkspacePage from "./workspace-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? <WorkspacePage /> : <LandingPage />;
}
