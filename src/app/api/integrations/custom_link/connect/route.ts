import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAddIntegration } from "@/lib/integrations/limit";
import { fetchLinkMetadata } from "@/lib/integrations/custom-link";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, title } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const { allowed, reason } = await canAddIntegration(supabase, user.id, "custom_link");
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const metadata = await fetchLinkMetadata(url);
  if (title) metadata.title = title;

  // Use a hash of the URL as platform_user_id to allow multiple custom links
  const platformUserId = Buffer.from(url).toString("base64url").slice(0, 64);

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      platform: "custom_link",
      platform_user_id: platformUserId,
      cached_data: metadata,
      is_active: true,
    },
    { onConflict: "user_id,platform,platform_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: metadata });
}
