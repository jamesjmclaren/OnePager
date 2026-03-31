"use client";

import { Star, GitFork, ExternalLink } from "lucide-react";

interface Repo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}

interface GitHubEmbedProps {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  repos: Repo[];
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Ruby: "#701516",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
};

export function GitHubEmbed({
  username,
  name,
  bio,
  avatarUrl,
  profileUrl,
  publicRepos,
  followers,
  repos,
}: GitHubEmbedProps) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={username}
          className="h-12 w-12 rounded-full"
        />
        <div className="flex-1">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold hover:underline" style={{ color: "var(--accent)" }}
          >
            {name ?? username}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {bio && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{bio}</p>}
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-sm text-gray-500">
        <span>{publicRepos} repos</span>
        <span>{followers} followers</span>
      </div>
      {repos.length > 0 && (
        <div className="mt-4 grid gap-2">
          {repos.slice(0, 4).map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border p-3 transition-colors" style={{ borderColor: "var(--card-border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                  {repo.name}
                </span>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  {repo.language && (
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            languageColors[repo.language] ?? "#888",
                        }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {repo.stars}
                    </span>
                  )}
                </div>
              </div>
              {repo.description && (
                <p className="mt-1 text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                  {repo.description}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
