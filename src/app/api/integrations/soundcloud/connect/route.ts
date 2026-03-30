import { handleManualConnect } from "@/lib/integrations/manual-connect";
import { fetchSoundCloudData } from "@/lib/integrations/soundcloud";

export async function POST(request: Request) {
  return handleManualConnect(
    request,
    "soundcloud",
    (identifier) =>
      fetchSoundCloudData(
        identifier.startsWith("http")
          ? identifier
          : `https://soundcloud.com/${identifier}`
      ),
    (data) => data.username as string
  );
}
