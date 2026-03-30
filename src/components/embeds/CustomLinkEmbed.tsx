"use client";

import { ExternalLink } from "lucide-react";

interface CustomLinkEmbedProps {
  url: string;
  title: string;
  description: string | null;
  image: string | null;
  favicon: string | null;
}

export function CustomLinkEmbed({
  url,
  title,
  description,
  image,
  favicon,
}: CustomLinkEmbedProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 rounded-xl border p-4 transition-colors"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : favicon ? (
        <img
          src={favicon}
          alt=""
          className="h-8 w-8 rounded"
        />
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{title}</p>
        {description && (
          <p className="mt-0.5 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
        <p className="mt-1 text-xs truncate" style={{ color: "var(--text-muted)" }}>{url}</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
    </a>
  );
}
