import { SupabaseClient } from "@supabase/supabase-js";

export type PlanType = "free" | "pro";

export const FREE_PLATFORMS = [
  "youtube",
  "twitter",
  "twitch",
  "github",
  "bluesky",
  "custom_link",
] as const;

export const PRO_ONLY_PLATFORMS = [
  "spotify",
  "discord",
  "substack",
  "medium",
  "reddit",
  "kick",
  "soundcloud",
  "mastodon",
] as const;

export const ALL_PLATFORMS = [...FREE_PLATFORMS, ...PRO_ONLY_PLATFORMS] as const;

export type PlatformId = (typeof ALL_PLATFORMS)[number];

export const PLAN_LIMITS = {
  free: {
    maxIntegrations: 3,
    themes: ["default", "minimal", "dark"],
    layoutModes: ["single"] as string[],
    canDragDrop: false,
    canAddHeaders: false,
    canCustomDomain: false,
  },
  pro: {
    maxIntegrations: Infinity,
    themes: [
      "default",
      "minimal",
      "dark",
      "gradient-sunset",
      "gradient-ocean",
      "neon",
      "glassmorphism",
      "brutalist",
      "retro",
      "pastel",
      "midnight",
      "forest",
      "monochrome",
    ],
    layoutModes: ["single", "grid"] as string[],
    canDragDrop: true,
    canAddHeaders: true,
    canCustomDomain: true,
  },
} as const;

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanType> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  return (data?.plan as PlanType) ?? "free";
}

export async function isPro(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const plan = await getUserPlan(supabase, userId);
  return plan === "pro";
}

export function isProOnlyPlatform(platform: string): boolean {
  return (PRO_ONLY_PLATFORMS as readonly string[]).includes(platform);
}

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}
