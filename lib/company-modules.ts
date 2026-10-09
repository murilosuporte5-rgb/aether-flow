import type { SupabaseClient } from "@supabase/supabase-js";

export const optionalModules = ["messages"] as const;
export type OptionalModule = typeof optionalModules[number];

export async function isCompanyModuleEnabled(supabase: SupabaseClient, companyId: string, moduleKey: OptionalModule) {
  const { data, error } = await supabase.from("company_modules")
    .select("enabled").eq("company_id", companyId).eq("module_key", moduleKey).maybeSingle();
  if (error) throw error;
  return data?.enabled ?? true;
}
