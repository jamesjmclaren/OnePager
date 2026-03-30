"use client";

import { ExternalLink } from "lucide-react";

interface Post {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
}

interface SubstackEmbedProps {
  title: string;
  description: string | null;
  link: string;
  image: string | null;
  posts: Post[];
}

export function SubstackEmbed({
  title,
  description,
  link,
  image,
  posts,
}: SubstackEmbedProps) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3">
        {image && (
          <img src={image} alt={title} className="h-10 w-10 rounded-lg" />
        )}
        <div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {description && (
            <p className="text-sm line-clamp-1" style={{ color: "var(--text-secondary)" }}>{description}</p>
          )}
        </div>
      </div>
      {posts.length > 0 && (
        <div className="mt-4 space-y-2">
          {posts.slice(0, 3).map((post) => (
            <a
              key={post.link}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{post.title}</p>
              <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                {post.excerpt}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date(post.pubDate).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
