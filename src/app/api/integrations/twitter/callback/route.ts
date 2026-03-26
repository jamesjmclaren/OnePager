import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeTwitterCode, fetchTwitterData } from "@/lib/integrations/twitter";

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

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=missing_verifier", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/twitter/callback`;
  const tokens = await exchangeTwitterCode(code, redirectUri, codeVerifier);

  if (tokens.error) {
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=token_exchange", process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const twitterData = await fetchTwitterData(tokens.access_token);

  await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      platform: "twitter",
      platform_user_id: twitterData?.userId ?? null,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(
        Date.now() + tokens.expires_in * 1000
      ).toISOString(),
      cached_data: twitterData,
      is_active: true,
    },
    { onConflict: "user_id,platform" }
  );

  // Clear the code verifier cookie
  cookieStore.delete("twitter_code_verifier");

  return NextResponse.redirect(
    new URL("/dashboard/integrations?success=twitter", process.env.NEXT_PUBLIC_APP_URL!)
  );
}
