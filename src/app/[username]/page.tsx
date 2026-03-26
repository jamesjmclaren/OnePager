import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileHeader } from "@/components/public-page/ProfileHeader";
import { WidgetRenderer } from "@/components/public-page/WidgetRenderer";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("slug", username)
    .single();

  if (!profile) return { title: "Not Found" };

  return {
    title: `${profile.display_name} | OnePager`,
    description: profile.bio ?? `${profile.display_name}'s OnePager`,
    openGraph: {
      title: `${profile.display_name} | OnePager`,
      description: profile.bio ?? `${profile.display_name}'s OnePager`,
    },
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = createAdminClient();

  // Get profile by slug
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", username)
    .single();

  if (!profile) notFound();

  // Get page config
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  if (!page?.is_published) notFound();

  // Get integrations for widget data
  const { data: integrations } = await supabase
    .from("integrations")
    .select("platform, cached_data, is_active")
    .eq("user_id", profile.id)
    .eq("is_active", true);

  // Build widgets from layout config, falling back to all integrations
  const layout = (page.layout as Array<{ type: string }>) ?? [];
  const widgets = layout.length > 0
    ? layout
        .map((item) => {
          const integration = integrations?.find(
            (i) => i.platform === item.type
          );
          if (!integration) return null;
          return {
            type: integration.platform as "youtube" | "twitter" | "twitch",
            data: (integration.cached_data ?? {}) as Record<string, unknown>,
          };
        })
        .filter(Boolean) as Array<{ type: "youtube" | "twitter" | "twitch"; data: Record<string, unknown> }>
    : (integrations ?? []).map((i) => ({
        type: i.platform as "youtube" | "twitter" | "twitch",
        data: (i.cached_data ?? {}) as Record<string, unknown>,
      }));

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <ProfileHeader
        displayName={profile.display_name}
        bio={profile.bio}
        avatarUrl={profile.avatar_url}
      />
      <div className="mt-8">
        <WidgetRenderer widgets={widgets} />
      </div>
      <footer className="mt-12 text-center text-sm text-gray-400">
        Powered by OnePager
      </footer>
    </main>
  );
}
