"use client";

import { Users, ExternalLink } from "lucide-react";

interface DiscordEmbedProps {
  serverId: string;
  name: string;
  instantInvite: string | null;
  presenceCount: number;
}

export function DiscordEmbed({
  serverId,
  name,
  instantInvite,
  presenceCount,
}: DiscordEmbedProps) {
  return (
    <div className="rounded-xl border bg-[#5865F2]/5 p-5" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5865F2] text-white font-bold text-lg">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{name}</p>
            <p className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Users className="h-3.5 w-3.5" />
              {presenceCount} online
            </p>
          </div>
        </div>
        {instantInvite && (
          <a
            href={instantInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
          >
            Join
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <iframe
        src={`https://discord.com/widget?id=${serverId}&theme=light`}
        width="100%"
        height="300"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        className="mt-4 rounded-lg border-0"
      />
    </div>
  );
}
