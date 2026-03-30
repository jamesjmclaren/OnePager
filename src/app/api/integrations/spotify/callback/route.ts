import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeSpotifyCode, fetchSpotifyData } from "@/lib/integrations/spotify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

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

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/spotify/callback`;
  const tokens = await exchangeSpotifyCode(code, redirectUri);

  if (tokens.error) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=token_exchange", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const spotifyData = await fetchSpotifyData(tokens.access_token);

  await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      platform: "spotify",
      platform_user_id: spotifyData?.userId ?? null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000
      ).toISOString(),
      cached_data: spotifyData,
      is_active: true,
    },
    { onConflict: "user_id,platform,platform_user_id" }
  );

  return NextResponse.redirect(
    new URL("/dashboard/integrations?success=spotify", process.env.NEXT_PUBLIC_APP_URL!)
  );
}
