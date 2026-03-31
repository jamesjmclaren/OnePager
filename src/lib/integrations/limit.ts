import { SupabaseClient } from "@supabase/supabase-js";
import { getUserPlan, getPlanLimits, isProOnlyPlatform } from "@/lib/plan";

export async function canAddIntegration(
  supabase: SupabaseClient,
  userId: string,
  platform: string
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(supabase, userId);
  const limits = getPlanLimits(plan);

  // Check if this is a pro-only platform
  if (plan === "free" && isProOnlyPlatform(platform)) {
    return {
      allowed: false,
      reason: `${platform} is a Pro-only integration. Upgrade to unlock it.`,
    };
  }

  // Check if this platform is already connected (reconnect is always allowed)
  const { data: existing } = await supabase
    .from("integrations")
    .select("id")
    .eq("user_id", userId)
    .eq("platform", platform)
    .single();

  if (existing) return { allowed: true };

  // Check current integration count against plan limit
  if (limits.maxIntegrations !== Infinity) {
    const { count } = await supabase
      .from("integrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true);

    if ((count ?? 0) >= limits.maxIntegrations) {
      return {
        allowed: false,
        reason: `Free plan is limited to ${limits.maxIntegrations} integrations. Upgrade to Pro for unlimited.`,
      };
    }
  }

  return { allowed: true };
}
