import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const platforms = [
  {
    id: "youtube" as const,
    name: "YouTube",
    description: "Embed your latest video",
    color: "bg-red-500",
  },
  {
    id: "twitter" as const,
    name: "Twitter / X",
    description: "Show your recent tweets",
    color: "bg-blue-400",
  },
  {
    id: "twitch" as const,
    name: "Twitch",
    description: "Display your live stream status",
    color: "bg-purple-500",
  },
];

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: integrations } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user?.id);

  const connectedPlatforms = new Set(
    integrations?.map((i) => i.platform) ?? []
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Integrations</h1>
      <p className="mt-1 text-gray-600">
        Connect your platforms to display content on your page.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((platform) => {
          const isConnected = connectedPlatforms.has(platform.id);
          return (
            <Card key={platform.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${platform.color}`}
                    />
                    {platform.name}
                  </CardTitle>
                  {isConnected && (
                    <Badge variant="secondary">Connected</Badge>
                  )}
                </div>
                <CardDescription>{platform.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isConnected ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/integrations/${platform.id}/connect`}>
                      Reconnect
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <a href={`/api/integrations/${platform.id}/connect`}>
                      Connect
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
