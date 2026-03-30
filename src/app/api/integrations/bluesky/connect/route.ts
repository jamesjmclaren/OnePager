import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchBlueskyData } from "@/lib/integrations/bluesky";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "bluesky",
    (identifier) => fetchBlueskyData(identifier),
    (data) => data.handle as string
  );
}
