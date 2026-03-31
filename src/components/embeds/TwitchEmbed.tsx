"use client";

interface TwitchEmbedProps {
  channelName: string;
  isLive: boolean;
  streamTitle?: string | null;
  gameName?: string | null;
  viewerCount?: number;
}

export function TwitchEmbed({
  channelName,
  isLive,
  streamTitle,
  gameName,
  viewerCount,
}: TwitchEmbedProps) {
  if (!isLive) {
    return (
      <div
        className="rounded-xl border p-6"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "var(--text-muted)" }} />
          <span className="font-medium">{channelName}</span>
        </div>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>Currently offline</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://player.twitch.tv/?channel=${channelName}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`}
          allowFullScreen
        />
      </div>
      <div
        className="rounded-b-xl p-3"
        style={{ backgroundColor: "var(--card-bg)", color: "var(--text-primary)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium">LIVE</span>
          {viewerCount !== undefined && (
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {viewerCount.toLocaleString()} viewers
            </span>
          )}
        </div>
        {streamTitle && (
          <p className="mt-1 text-sm">{streamTitle}</p>
        )}
        {gameName && (
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{gameName}</p>
        )}
      </div>
    </div>
  );
}
