"use client";

import { ExternalLink } from "lucide-react";

interface SoundCloudEmbedProps {
  username: string;
  profileUrl: string;
  authorName: string;
  thumbnailUrl: string | null;
}

export function SoundCloudEmbed({
  username,
  profileUrl,
  authorName,
  thumbnailUrl,
}: SoundCloudEmbedProps) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3 p-4">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={authorName}
            className="h-10 w-10 rounded-lg"
          />
        )}
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-semibold hover:underline"
        >
          {authorName}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        width="100%"
        height="300"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(profileUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true`}
        className="border-0"
      />
    </div>
  );
}
