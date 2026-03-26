import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getYouTubeAuthUrl } from "@/lib/integrations/youtube";
import { canAddIntegration } from "@/lib/integrations/limit";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { allowed, reason } = await canAddIntegration(supabase, user.id, "youtube");
  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(reason!)}`, process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/youtube/callback`;
  const authUrl = getYouTubeAuthUrl(redirectUri, user.id);

  return NextResponse.redirect(authUrl);
}
