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
      <div className="rounded-xl border bg-gray-900 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-gray-500" />
          <span className="font-medium">{channelName}</span>
        </div>
        <p className="mt-2 text-sm text-gray-400">Currently offline</p>
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
      <div className="rounded-b-xl bg-gray-900 p-3 text-white">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium">LIVE</span>
          {viewerCount !== undefined && (
            <span className="text-sm text-gray-400">
              {viewerCount.toLocaleString()} viewers
            </span>
          )}
        </div>
        {streamTitle && (
          <p className="mt-1 text-sm">{streamTitle}</p>
        )}
        {gameName && (
          <p className="text-xs text-gray-400">{gameName}</p>
        )}
      </div>
    </div>
  );
}
