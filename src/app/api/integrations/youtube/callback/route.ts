import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeYouTubeCode, fetchYouTubeData } from "@/lib/integrations/youtube";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // user id

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=missing_params", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== state) {
    return NextResponse.redirect(
      new URL("/login", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`;
  const tokens = await exchangeYouTubeCode(code, redirectUri);

  if (tokens.error) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=token_exchange", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  // Fetch YouTube data
  const youtubeData = await fetchYouTubeData(tokens.access_token);

  // Upsert integration
  await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      platform: "youtube",
      platform_user_id: youtubeData?.channelId ?? null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000
      ).toISOString(),
      cached_data: youtubeData,
      is_active: true,
    },
    { onConflict: "user_id,platform" }
  );

  return NextResponse.redirect(
    new URL("/dashboard/integrations?success=youtube", process.env.NEXT_PUBLIC_APP_URL!)
  );
}
