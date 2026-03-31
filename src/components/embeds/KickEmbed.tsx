"use client";

import { ExternalLink, Radio, Eye } from "lucide-react";

interface KickEmbedProps {
  username: string;
  displayName: string;
  profileImage: string | null;
  isLive: boolean;
  streamTitle: string | null;
  gameName: string | null;
  viewerCount: number;
}

export function KickEmbed({
  username,
  displayName,
  profileImage,
  isLive,
  streamTitle,
  gameName,
  viewerCount,
}: KickEmbedProps) {
  if (isLive) {
    return (
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
        <iframe
          src={`https://player.kick.com/${username}`}
          width="100%"
          height="360"
          allowFullScreen
          className="border-0"
        />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
              <Radio className="h-3 w-3" />
              LIVE
            </span>
            <span className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Eye className="h-3.5 w-3.5" />
              {viewerCount.toLocaleString()}
            </span>
          </div>
          {streamTitle && (
            <p className="mt-2 font-medium" style={{ color: "var(--text-primary)" }}>{streamTitle}</p>
          )}
          {gameName && (
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{gameName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3">
        {profileImage && (
          <img
            src={profileImage}
            alt={displayName}
            className="h-12 w-12 rounded-full"
          />
        )}
        <div>
          <a
            href={`https://kick.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {displayName}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Offline on Kick</p>
        </div>
      </div>
    </div>
  );
}
