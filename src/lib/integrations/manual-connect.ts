import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAddIntegration } from "@/lib/integrations/limit";

export async function handleManualConnect(
  request: Request,
  platform: string,
  fetchData: (identifier: string) => Promise<Record<string, unknown> | null>,
  extractPlatformUserId: (data: Record<string, unknown>) => string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { identifier } = body;

  if (!identifier || typeof identifier !== "string") {
    return NextResponse.json(
      { error: "identifier is required" },
      { status: 400 }
    );
  }

  const { allowed, reason } = await canAddIntegration(
    supabase,
    user.id,
    platform
  );
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  const data = await fetchData(identifier.trim());
  if (!data) {
    return NextResponse.json(
      { error: `Could not find ${platform} data for "${identifier}"` },
      { status: 404 }
    );
  }

  const platformUserId = extractPlatformUserId(data);

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id,
      platform,
      platform_user_id: platformUserId,
      cached_data: data,
      is_active: true,
    },
    { onConflict: "user_id,platform,platform_user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
