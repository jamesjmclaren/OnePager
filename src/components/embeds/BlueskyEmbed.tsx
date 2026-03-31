"use client";

import { ExternalLink, Heart, Repeat2 } from "lucide-react";

interface Post {
  uri: string;
  text: string;
  createdAt: string;
  likes: number;
  reposts: number;
}

interface BlueskyEmbedProps {
  handle: string;
  displayName: string;
  avatar: string | null;
  followersCount: number;
  postsCount: number;
  posts: Post[];
}

export function BlueskyEmbed({
  handle,
  displayName,
  avatar,
  followersCount,
  postsCount,
  posts,
}: BlueskyEmbedProps) {
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
            href={`https://bsky.app/profile/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {displayName}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>@{handle}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
        <span>{followersCount} followers</span>
        <span>{postsCount} posts</span>
      </div>
      {posts.length > 0 && (
        <div className="mt-4 space-y-3">
          {posts.slice(0, 3).map((post) => (
            <div key={post.uri} className="rounded-lg border p-3" style={{ borderColor: "var(--card-border)" }}>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{post.text}</p>
              <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3 w-3" />
                  {post.reposts}
                </span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
