export function parseMastodonHandle(handle: string): {
  username: string;
  instance: string;
} | null {
  // Accept @user@instance or user@instance
  const match = handle.match(/^@?([^@]+)@([^@]+)$/);
  if (!match) return null;
  return { username: match[1], instance: match[2] };
}

export async function fetchMastodonData(handle: string) {
  const parsed = parseMastodonHandle(handle);
  if (!parsed) return null;

  const { username, instance } = parsed;

  // Look up account
  const lookupRes = await fetch(
    `https://${instance}/api/v1/accounts/lookup?acct=${username}`,
    { signal: AbortSignal.timeout(10000) }
  );
  if (!lookupRes.ok) return null;

  const account = await lookupRes.json();

  // Fetch recent statuses
  const statusesRes = await fetch(
    `https://${instance}/api/v1/accounts/${account.id}/statuses?limit=5&exclude_replies=true`,
    { signal: AbortSignal.timeout(10000) }
  );
  const statuses = statusesRes.ok ? await statusesRes.json() : [];

  return {
    handle: `@${username}@${instance}`,
    displayName: account.display_name,
    username: account.username,
    instance,
    avatar: account.avatar,
    bio: account.note ? stripHtml(account.note) : null,
    followersCount: account.followers_count,
    followingCount: account.following_count,
    statusesCount: account.statuses_count,
    profileUrl: account.url,
    posts: (statuses as Array<{
      id: string;
      content: string;
      created_at: string;
      favourites_count: number;
      reblogs_count: number;
      url: string;
    }>)
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        text: stripHtml(s.content),
        createdAt: s.created_at,
        favourites: s.favourites_count,
        reblogs: s.reblogs_count,
        url: s.url,
      })),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
