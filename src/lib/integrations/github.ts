const GITHUB_API = "https://api.github.com";

export async function fetchGitHubData(username: string) {
  const [userRes, reposRes] = await Promise.all([
    fetch(`${GITHUB_API}/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    }),
    fetch(`${GITHUB_API}/users/${username}/repos?sort=stars&per_page=6`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    }),
  ]);

  if (!userRes.ok) return null;

  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  return {
    username: user.login,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    repos: repos.map(
      (r: {
        name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        language: string | null;
      }) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
      })
    ),
  };
}
