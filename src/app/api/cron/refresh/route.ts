import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshYouTubeToken, fetchYouTubeData } from "@/lib/integrations/youtube";
import { refreshTwitterToken, fetchTwitterData } from "@/lib/integrations/twitter";
import { refreshTwitchToken, fetchTwitchData } from "@/lib/integrations/twitch";
import { refreshSpotifyToken, fetchSpotifyData } from "@/lib/integrations/spotify";
import { fetchGitHubData } from "@/lib/integrations/github";
import { fetchBlueskyData } from "@/lib/integrations/bluesky";
import { fetchSubstackData } from "@/lib/integrations/substack";
import { fetchMediumData } from "@/lib/integrations/medium";
import { fetchRedditData } from "@/lib/integrations/reddit";
import { fetchDiscordData } from "@/lib/integrations/discord";
import { fetchKickData } from "@/lib/integrations/kick";
import { fetchMastodonData } from "@/lib/integrations/mastodon";
import { fetchSoundCloudData } from "@/lib/integrations/soundcloud";
import { fetchLinkMetadata } from "@/lib/integrations/custom-link";

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Token refresh handlers for OAuth platforms
const tokenRefreshers: Record<
  string,
  (refreshToken: string) => Promise<TokenData>
> = {
  youtube: refreshYouTubeToken,
  twitter: refreshTwitterToken,
  twitch: refreshTwitchToken,
  spotify: refreshSpotifyToken,
};

// Data fetchers — OAuth platforms use access_token, manual platforms use platform_user_id
type FetcherFn = (
  tokenOrId: string,
  cachedData?: Record<string, unknown>
) => Promise<Record<string, unknown> | null>;

const dataFetchers: Record<string, FetcherFn> = {
  youtube: (token) => fetchYouTubeData(token),
  twitter: (token) => fetchTwitterData(token),
  twitch: (token) => fetchTwitchData(token),
  spotify: (token) => fetchSpotifyData(token),
  github: (_token, cached) =>
    fetchGitHubData((cached?.username as string) ?? ""),
  bluesky: (_token, cached) =>
    fetchBlueskyData((cached?.handle as string) ?? ""),
  substack: (_token, cached) =>
    fetchSubstackData((cached?.publication as string) ?? ""),
  medium: (_token, cached) =>
    fetchMediumData((cached?.username as string) ?? ""),
  reddit: (_token, cached) =>
    fetchRedditData((cached?.username as string) ?? ""),
  discord: (_token, cached) =>
    fetchDiscordData((cached?.serverId as string) ?? ""),
  kick: (_token, cached) =>
    fetchKickData((cached?.username as string) ?? ""),
  mastodon: (_token, cached) =>
    fetchMastodonData((cached?.handle as string) ?? ""),
  soundcloud: (_token, cached) =>
    fetchSoundCloudData((cached?.profileUrl as string) ?? ""),
  custom_link: (_token, cached) =>
    fetchLinkMetadata((cached?.url as string) ?? ""),
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: integrations } = await supabase
    .from("integrations")
    .select("*")
    .eq("is_active", true);

  if (!integrations) {
    return NextResponse.json({ refreshed: 0 });
  }

  let refreshed = 0;
  let errors = 0;

  for (const integration of integrations) {
    try {
      let accessToken = integration.access_token;

      // Refresh OAuth token if expired
      const isExpired =
        integration.token_expires_at &&
        new Date(integration.token_expires_at) < new Date();

      if (isExpired && integration.refresh_token) {
        const refresher = tokenRefreshers[integration.platform];
        if (refresher) {
          const tokenData = await refresher(integration.refresh_token);
          if (tokenData?.access_token) {
            accessToken = tokenData.access_token;
            await supabase
              .from("integrations")
              .update({
                access_token: tokenData.access_token,
                refresh_token:
                  tokenData.refresh_token ?? integration.refresh_token,
                token_expires_at: new Date(
                  Date.now() + (tokenData.expires_in ?? 3600) * 1000
                ).toISOString(),
              })
              .eq("id", integration.id);
          }
        }
      }

      // Fetch fresh data
      const fetcher = dataFetchers[integration.platform];
      if (fetcher) {
        const cachedData = await fetcher(
          accessToken ?? "",
          (integration.cached_data as Record<string, unknown>) ?? {}
        );
        if (cachedData) {
          await supabase
            .from("integrations")
            .update({ cached_data: cachedData })
            .eq("id", integration.id);
          refreshed++;
        }
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    refreshed,
    errors,
    total: integrations.length,
  });
}
