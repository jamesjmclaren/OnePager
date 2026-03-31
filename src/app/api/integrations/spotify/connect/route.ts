import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSpotifyAuthUrl } from "@/lib/integrations/spotify";
import { canAddIntegration } from "@/lib/integrations/limit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { allowed, reason } = await canAddIntegration(supabase, user.id, "spotify");
  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(reason!)}`, process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/spotify/callback`;
  const authUrl = getSpotifyAuthUrl(redirectUri, user.id);

  return NextResponse.redirect(authUrl);
}
