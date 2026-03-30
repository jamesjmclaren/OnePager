"use client";

import { ExternalLink } from "lucide-react";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  excerpt: string;
}

interface MediumEmbedProps {
  title: string;
  link: string;
  articles: Article[];
}

export function MediumEmbed({ title, link, articles }: MediumEmbedProps) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
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
      {articles.length > 0 && (
        <div className="mt-4 space-y-2">
          {articles.slice(0, 3).map((article) => (
            <a
              key={article.link}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{article.title}</p>
              <p className="mt-1 text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                {article.excerpt}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date(article.pubDate).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
