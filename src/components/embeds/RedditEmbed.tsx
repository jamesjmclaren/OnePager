"use client";

import { ArrowUp, MessageSquare, ExternalLink } from "lucide-react";

interface Post {
  id: string;
  title: string;
  subreddit: string;
  score: number;
  comments: number;
  url: string;
  createdAt: string;
}

interface RedditEmbedProps {
  username: string;
  karma: number;
  icon: string | null;
  posts: Post[];
}

export function RedditEmbed({ username, karma, icon, posts }: RedditEmbedProps) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3">
        {icon && (
          <img src={icon} alt={username} className="h-10 w-10 rounded-full" />
        )}
        <div>
          <a
            href={`https://reddit.com/user/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            u/{username}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{karma.toLocaleString()} karma</p>
        </div>
      </div>
      {posts.length > 0 && (
        <div className="mt-4 space-y-2">
          {posts.slice(0, 3).map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{post.subreddit}</p>
              <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{post.title}</p>
              <div className="mt-2 flex gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-0.5">
                  <ArrowUp className="h-3 w-3" />
                  {post.score}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" />
                  {post.comments}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
