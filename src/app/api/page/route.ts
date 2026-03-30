import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan, getPlanLimits } from "@/lib/plan";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json(page);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { layout, theme, layout_mode, is_published } = body;

  // Validate theme against user's plan
  if (theme) {
    const plan = await getUserPlan(supabase, user.id);
    const limits = getPlanLimits(plan);
    if (!(limits.themes as readonly string[]).includes(theme)) {
      return NextResponse.json(
        { error: "This theme requires a Pro plan." },
        { status: 403 }
      );
    }
  }

  // Validate layout_mode against user's plan
  if (layout_mode) {
    const plan = await getUserPlan(supabase, user.id);
    const limits = getPlanLimits(plan);
    if (!limits.layoutModes.includes(layout_mode)) {
      return NextResponse.json(
        { error: "Grid layout requires a Pro plan." },
        { status: 403 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (layout !== undefined) updateData.layout = layout;
  if (theme !== undefined) updateData.theme = theme;
  if (layout_mode !== undefined) updateData.layout_mode = layout_mode;
  if (is_published !== undefined) updateData.is_published = is_published;

  const { data, error } = await supabase
    .from("pages")
    .update(updateData)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
