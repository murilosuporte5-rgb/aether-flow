import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return key ? createClient(SUPABASE_URL, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}
