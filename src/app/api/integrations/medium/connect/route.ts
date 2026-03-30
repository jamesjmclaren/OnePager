import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchMediumData } from "@/lib/integrations/medium";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "medium",
    (identifier) => fetchMediumData(identifier),
    (data) => data.username as string
  );
}
