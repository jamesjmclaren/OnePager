import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchRedditData } from "@/lib/integrations/reddit";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "reddit",
    (identifier) => fetchRedditData(identifier),
    (data) => data.username as string
  );
}
