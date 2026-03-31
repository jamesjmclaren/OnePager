import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchDiscordData } from "@/lib/integrations/discord";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "discord",
    (identifier) => fetchDiscordData(identifier),
    (data) => data.serverId as string
  );
}
