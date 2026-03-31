import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchKickData } from "@/lib/integrations/kick";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "kick",
    (identifier) => fetchKickData(identifier),
    (data) => data.username as string
  );
}
