import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshYouTubeToken, fetchYouTubeData } from "@/lib/integrations/youtube";
import { refreshTwitterToken, fetchTwitterData } from "@/lib/integrations/twitter";
import { refreshTwitchToken, fetchTwitchData } from "@/lib/integrations/twitch";

export async function GET(request: Request) {
  // Verify cron secret
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
      const isExpired =
        integration.token_expires_at &&
        new Date(integration.token_expires_at) < new Date();

      let accessToken = integration.access_token;

      // Refresh token if expired
      if (isExpired && integration.refresh_token) {
        let tokenData;
        switch (integration.platform) {
          case "youtube":
            tokenData = await refreshYouTubeToken(integration.refresh_token);
            break;
          case "twitter":
            tokenData = await refreshTwitterToken(integration.refresh_token);
            break;
          case "twitch":
            tokenData = await refreshTwitchToken(integration.refresh_token);
            break;
        }

        if (tokenData?.access_token) {
          accessToken = tokenData.access_token;
          await supabase
            .from("integrations")
            .update({
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token ?? integration.refresh_token,
              token_expires_at: new Date(
                Date.now() + (tokenData.expires_in ?? 3600) * 1000
              ).toISOString(),
            })
            .eq("id", integration.id);
        }
      }

      // Fetch fresh data
      let cachedData;
      switch (integration.platform) {
        case "youtube":
          cachedData = await fetchYouTubeData(accessToken);
          break;
        case "twitter":
          cachedData = await fetchTwitterData(accessToken);
          break;
        case "twitch":
          cachedData = await fetchTwitchData(accessToken);
          break;
      }

      if (cachedData) {
        await supabase
          .from("integrations")
          .update({ cached_data: cachedData })
          .eq("id", integration.id);
        refreshed++;
      }
    } catch {
      errors++;
    }
  }

  return NextResponse.json({ refreshed, errors, total: integrations.length });
}
