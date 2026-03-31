"use client";

import { ExternalLink, Heart, Repeat2 } from "lucide-react";

interface Post {
  id: string;
  text: string;
  createdAt: string;
  favourites: number;
  reblogs: number;
  url: string;
}

interface MastodonEmbedProps {
  handle: string;
  displayName: string;
  avatar: string | null;
  followersCount: number;
  statusesCount: number;
  profileUrl: string;
  posts: Post[];
}

export function MastodonEmbed({
  handle,
  displayName,
  avatar,
  followersCount,
  statusesCount,
  profileUrl,
  posts,
}: MastodonEmbedProps) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={displayName}
            className="h-12 w-12 rounded-full"
          />
        )}
        <div className="flex-1">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {displayName}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{handle}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
        <span>{followersCount} followers</span>
        <span>{statusesCount} posts</span>
      </div>
      {posts.length > 0 && (
        <div className="mt-4 space-y-3">
          {posts.slice(0, 3).map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{post.text}</p>
              <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.favourites}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3 w-3" />
                  {post.reblogs}
                </span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
