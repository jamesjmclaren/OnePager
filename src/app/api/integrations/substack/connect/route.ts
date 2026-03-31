import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchSubstackData } from "@/lib/integrations/substack";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "substack",
    (identifier) => fetchSubstackData(identifier),
    (data) => data.publication as string
  );
}
