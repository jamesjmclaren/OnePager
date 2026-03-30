import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchGitHubData } from "@/lib/integrations/github";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "github",
    (identifier) => fetchGitHubData(identifier),
    (data) => data.username as string
  );
}
