import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPro } from "@/lib/plan";
import { generateTxtRecord, removeDomainFromVercel } from "@/lib/domains";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: domains } = await supabase
    .from("custom_domains")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(domains ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userIsPro = await isPro(supabase, user.id);
  if (!userIsPro) {
    return NextResponse.json(
      { error: "Custom domains require a Pro plan." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { domain } = body;

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  // Basic domain validation
  const cleanDomain = domain.trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(cleanDomain)) {
    return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
  }

  const txtRecord = generateTxtRecord();

  const { data, error } = await supabase
    .from("custom_domains")
    .insert({
      user_id: user.id,
      domain: cleanDomain,
      txt_record: txtRecord,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This domain is already registered." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domainId = searchParams.get("id");

  if (!domainId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Get domain before deleting (for Vercel cleanup)
  const { data: domain } = await supabase
    .from("custom_domains")
    .select("domain, verified")
    .eq("id", domainId)
    .eq("user_id", user.id)
    .single();

  if (domain?.verified) {
    await removeDomainFromVercel(domain.domain);
  }

  const { error } = await supabase
    .from("custom_domains")
    .delete()
    .eq("id", domainId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
