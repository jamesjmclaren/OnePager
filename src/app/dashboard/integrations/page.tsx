"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, X } from "lucide-react";
import { FREE_PLATFORMS, PRO_ONLY_PLATFORMS, type PlatformId } from "@/lib/plan";

interface PlatformConfig {
  id: PlatformId;
  name: string;
  description: string;
  color: string;
  connectType: "oauth" | "manual";
  inputLabel?: string;
  inputPlaceholder?: string;
}

const platforms: PlatformConfig[] = [
  // Free platforms
  {
    id: "youtube",
    name: "YouTube",
    description: "Embed your latest video",
    color: "bg-red-500",
    connectType: "oauth",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Show your recent tweets",
    color: "bg-blue-400",
    connectType: "oauth",
  },
  {
    id: "twitch",
    name: "Twitch",
    description: "Display your live stream status",
    color: "bg-purple-500",
    connectType: "oauth",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Show your profile and top repos",
    color: "bg-gray-800",
    connectType: "manual",
    inputLabel: "GitHub Username",
    inputPlaceholder: "octocat",
  },
  {
    id: "bluesky",
    name: "Bluesky",
    description: "Show your recent posts",
    color: "bg-blue-500",
    connectType: "manual",
    inputLabel: "Bluesky Handle",
    inputPlaceholder: "user.bsky.social",
  },
  {
    id: "custom_link",
    name: "Custom Link",
    description: "Add any link to your page",
    color: "bg-green-500",
    connectType: "manual",
    inputLabel: "URL",
    inputPlaceholder: "https://example.com",
  },
  // Pro platforms
  {
    id: "spotify",
    name: "Spotify",
    description: "Show your top tracks and now playing",
    color: "bg-green-600",
    connectType: "oauth",
  },
  {
    id: "discord",
    name: "Discord",
    description: "Show your server widget and invite",
    color: "bg-indigo-500",
    connectType: "manual",
    inputLabel: "Server ID",
    inputPlaceholder: "123456789012345678",
  },
  {
    id: "substack",
    name: "Substack",
    description: "Show your latest newsletter posts",
    color: "bg-orange-500",
    connectType: "manual",
    inputLabel: "Publication Name",
    inputPlaceholder: "yourpublication",
  },
  {
    id: "medium",
    name: "Medium",
    description: "Show your latest articles",
    color: "bg-gray-700",
    connectType: "manual",
    inputLabel: "Medium Username",
    inputPlaceholder: "username (without @)",
  },
  {
    id: "reddit",
    name: "Reddit",
    description: "Show your recent posts",
    color: "bg-orange-600",
    connectType: "manual",
    inputLabel: "Reddit Username",
    inputPlaceholder: "username (without u/)",
  },
  {
    id: "kick",
    name: "Kick",
    description: "Display your live stream status",
    color: "bg-green-400",
    connectType: "manual",
    inputLabel: "Kick Username",
    inputPlaceholder: "username",
  },
  {
    id: "soundcloud",
    name: "SoundCloud",
    description: "Embed your music player",
    color: "bg-orange-400",
    connectType: "manual",
    inputLabel: "SoundCloud URL or Username",
    inputPlaceholder: "username or https://soundcloud.com/username",
  },
  {
    id: "mastodon",
    name: "Mastodon",
    description: "Show your recent toots",
    color: "bg-purple-600",
    connectType: "manual",
    inputLabel: "Mastodon Handle",
    inputPlaceholder: "@user@mastodon.social",
  },
];

const freePlatformIds = FREE_PLATFORMS as readonly string[];
const proPlatformIds = PRO_ONLY_PLATFORMS as readonly string[];

export default function IntegrationsPage() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(
    new Set()
  );
  const [userPlan, setUserPlan] = useState<string>("free");
  const [connectingPlatform, setConnectingPlatform] =
    useState<PlatformConfig | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: integrations }, { data: profile }] = await Promise.all([
        supabase.from("integrations").select("platform").eq("user_id", user.id),
        supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single(),
      ]);

      setConnectedPlatforms(
        new Set(integrations?.map((i) => i.platform) ?? [])
      );
      setUserPlan(profile?.plan ?? "free");
    };
    load();

    // Check URL params for OAuth callbacks
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setSuccess(`Successfully connected ${params.get("success")}!`);
    }
    if (params.get("error")) {
      setError(decodeURIComponent(params.get("error")!));
    }
  }, []);

  const handleManualConnect = async () => {
    if (!connectingPlatform || !identifier.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { identifier: identifier.trim() };
      // Custom link uses 'url' instead of 'identifier'
      if (connectingPlatform.id === "custom_link") {
        const res = await fetch(
          `/api/integrations/${connectingPlatform.id}/connect`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: identifier.trim() }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch(
          `/api/integrations/${connectingPlatform.id}/connect`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      setConnectedPlatforms((prev) => new Set([...prev, connectingPlatform.id]));
      setSuccess(`Successfully connected ${connectingPlatform.name}!`);
      setConnectingPlatform(null);
      setIdentifier("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const isProOnly = (platformId: string) =>
    proPlatformIds.includes(platformId);
  const isLocked = (platformId: string) =>
    userPlan === "free" && isProOnly(platformId);

  return (
    <div>
      <h1 className="text-2xl font-bold">Integrations</h1>
      <p className="mt-1 text-gray-600">
        Connect your platforms to display content on your page.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            dismiss
          </button>
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 underline">
            dismiss
          </button>
        </div>
      )}

      {/* Free platforms */}
      <h2 className="mt-8 text-lg font-semibold">Available Integrations</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms
          .filter((p) => freePlatformIds.includes(p.id))
          .map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isConnected={connectedPlatforms.has(platform.id)}
              isLocked={false}
              onConnect={() => {
                if (platform.connectType === "oauth") {
                  window.location.href = `/api/integrations/${platform.id}/connect`;
                } else {
                  setConnectingPlatform(platform);
                  setIdentifier("");
                  setError(null);
                }
              }}
            />
          ))}
      </div>

      {/* Pro platforms */}
      <h2 className="mt-10 flex items-center gap-2 text-lg font-semibold">
        Pro Integrations
        {userPlan === "free" && (
          <Badge variant="secondary" className="text-xs">
            <Lock className="mr-1 h-3 w-3" />
            Upgrade to unlock
          </Badge>
        )}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms
          .filter((p) => proPlatformIds.includes(p.id))
          .map((platform) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              isConnected={connectedPlatforms.has(platform.id)}
              isLocked={isLocked(platform.id)}
              onConnect={() => {
                if (isLocked(platform.id)) {
                  window.location.href = "/dashboard/upgrade";
                  return;
                }
                if (platform.connectType === "oauth") {
                  window.location.href = `/api/integrations/${platform.id}/connect`;
                } else {
                  setConnectingPlatform(platform);
                  setIdentifier("");
                  setError(null);
                }
              }}
            />
          ))}
      </div>

      {/* Manual connect modal */}
      {connectingPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Connect {connectingPlatform.name}
              </h3>
              <button
                onClick={() => setConnectingPlatform(null)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <Label htmlFor="identifier">
                {connectingPlatform.inputLabel ?? "Identifier"}
              </Label>
              <Input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={connectingPlatform.inputPlaceholder}
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualConnect();
                }}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConnectingPlatform(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualConnect}
                disabled={loading || !identifier.trim()}
              >
                {loading ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCard({
  platform,
  isConnected,
  isLocked,
  onConnect,
}: {
  platform: PlatformConfig;
  isConnected: boolean;
  isLocked: boolean;
  onConnect: () => void;
}) {
  return (
    <Card className={isLocked ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span
              className={`inline-block h-3 w-3 rounded-full ${platform.color}`}
            />
            {platform.name}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {isLocked && <Lock className="h-4 w-4 text-gray-400" />}
            {isConnected && <Badge variant="secondary">Connected</Badge>}
          </div>
        </div>
        <CardDescription>{platform.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="sm"
          variant={isConnected ? "outline" : isLocked ? "secondary" : "default"}
          onClick={onConnect}
        >
          {isLocked
            ? "Upgrade to Pro"
            : isConnected
              ? "Reconnect"
              : "Connect"}
        </Button>
      </CardContent>
    </Card>
  );
}
