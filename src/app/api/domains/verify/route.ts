import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyDomainDns, addDomainToVercel } from "@/lib/domains";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { domainId } = body;

  if (!domainId) {
    return NextResponse.json({ error: "domainId is required" }, { status: 400 });
  }

  const { data: domain } = await supabase
    .from("custom_domains")
    .select("*")
    .eq("id", domainId)
    .eq("user_id", user.id)
    .single();

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  if (domain.verified) {
    return NextResponse.json({ verified: true, message: "Already verified" });
  }

  const verified = await verifyDomainDns(domain.domain, domain.txt_record);

  if (!verified) {
    return NextResponse.json({
      verified: false,
      message: "TXT record not found. Make sure you added the DNS record and wait a few minutes for propagation.",
    });
  }

  // Add domain to Vercel
  await addDomainToVercel(domain.domain);

  // Mark as verified
  await supabase
    .from("custom_domains")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
    })
    .eq("id", domainId);

  return NextResponse.json({ verified: true, message: "Domain verified!" });
}
