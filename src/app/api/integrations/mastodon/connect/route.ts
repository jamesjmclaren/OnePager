import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchMastodonData } from "@/lib/integrations/mastodon";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "mastodon",
    (identifier) => fetchMastodonData(identifier),
    (data) => data.handle as string
  );
}
