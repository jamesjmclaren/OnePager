import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getTwitterAuthUrl } from "@/lib/integrations/twitter";
import { canAddIntegration } from "@/lib/integrations/limit";
import crypto from "crypto";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL));
  }

  const { allowed, reason } = await canAddIntegration(supabase, user.id, "twitter");
  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(reason!)}`, process.env.NEXT_PUBLIC_APP_URL!)
    );
  }

  const codeVerifier = crypto.randomBytes(32).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/twitter/callback`;
  const authUrl = getTwitterAuthUrl(redirectUri, user.id, codeVerifier);

  const cookieStore = await cookies();
  cookieStore.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(authUrl);
}
