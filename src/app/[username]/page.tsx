import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProfileHeader } from "@/components/public-page/ProfileHeader";
import { WidgetRenderer } from "@/components/public-page/WidgetRenderer";
import { ThemeProvider } from "@/components/public-page/ThemeProvider";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", username)
    .single();

  if (!profile) notFound();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  if (!page?.is_published) notFound();

  const { data: integrations } = await supabase
    .from("integrations")
    .select("platform, cached_data, is_active")
    .eq("user_id", profile.id)
    .eq("is_active", true);

  const layout = (page.layout as Array<{ type: string }>) ?? [];
  const layoutMode = (page.layout_mode as "single" | "grid") ?? "single";
  const themeId = (page.theme as string) ?? "default";

  const layoutItems = layout as Array<{ type: string; label?: string; itemType?: string }>;

  const widgets = layoutItems.length > 0
    ? layoutItems
        .map((item) => {
          // Pass header items through directly
          if (item.itemType === "header" || item.type === "header") {
            return {
              type: "header",
              data: { label: item.label ?? "" } as Record<string, unknown>,
            };
          }
          const integration = integrations?.find(
            (i) => i.platform === item.type
          );
          if (!integration) return null;
          return {
            type: integration.platform,
            data: (integration.cached_data ?? {}) as Record<string, unknown>,
          };
        })
        .filter(Boolean) as Array<{ type: string; data: Record<string, unknown> }>
    : (integrations ?? []).map((i) => ({
        type: i.platform,
        data: (i.cached_data ?? {}) as Record<string, unknown>,
      }));

  return (
    <ThemeProvider themeId={themeId}>
      <main className="mx-auto max-w-2xl px-4 py-12">
        <ProfileHeader
          displayName={profile.display_name}
          bio={profile.bio}
          avatarUrl={profile.avatar_url}
        />
        <div className="mt-8">
          <WidgetRenderer widgets={widgets} layoutMode={layoutMode} />
        </div>
        <footer className="mt-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Powered by OnePager
        </footer>
      </main>
    </ThemeProvider>
  );
}
