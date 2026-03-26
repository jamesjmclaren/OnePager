import { SupabaseClient } from "@supabase/supabase-js";

const FREE_INTEGRATION_LIMIT = 3;

export async function canAddIntegration(
  supabase: SupabaseClient,
  userId: string,
  platform: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if this platform is already connected (reconnect is always allowed)
  const { data: existing } = await supabase
    .from("integrations")
    .select("id")
    .eq("user_id", userId)
    .eq("platform", platform)
    .single();

  if (existing) return { allowed: true };

  // Check current integration count
  const { count } = await supabase
    .from("integrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_active", true);

  if ((count ?? 0) >= FREE_INTEGRATION_LIMIT) {
    return {
      allowed: false,
      reason: `Free plan is limited to ${FREE_INTEGRATION_LIMIT} integrations`,
    };
  }

  return { allowed: true };
}
