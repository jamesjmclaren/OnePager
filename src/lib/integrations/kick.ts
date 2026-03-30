export async function fetchKickData(username: string) {
  const res = await fetch(
    `https://kick.com/api/v2/channels/${username}`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (!res.ok) return null;

  const data = await res.json();

  return {
    username: data.slug ?? username,
    displayName: data.user?.username ?? username,
    profileImage: data.user?.profile_pic ?? null,
    isLive: data.livestream !== null,
    streamTitle: data.livestream?.session_title ?? null,
    gameName: data.livestream?.categories?.[0]?.name ?? null,
    viewerCount: data.livestream?.viewer_count ?? 0,
    followersCount: data.followers_count ?? 0,
    verified: data.verified ?? false,
  };
}
