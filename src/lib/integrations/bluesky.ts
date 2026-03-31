const BSKY_API = "https://public.api.bsky.app/xrpc";

export async function fetchBlueskyData(handle: string) {
  const profileRes = await fetch(
    `${BSKY_API}/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`
  );
  if (!profileRes.ok) return null;

  const profile = await profileRes.json();

  const feedRes = await fetch(
    `${BSKY_API}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=5`
  );
  const feedData = feedRes.ok ? await feedRes.json() : { feed: [] };

  return {
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName,
    description: profile.description,
    avatar: profile.avatar,
    followersCount: profile.followersCount,
    followsCount: profile.followsCount,
    postsCount: profile.postsCount,
    posts: (feedData.feed ?? [])
      .slice(0, 5)
      .map(
        (item: {
          post: {
            uri: string;
            record: { text: string; createdAt: string };
            likeCount?: number;
            repostCount?: number;
          };
        }) => ({
          uri: item.post.uri,
          text: item.post.record.text,
          createdAt: item.post.record.createdAt,
          likes: item.post.likeCount ?? 0,
          reposts: item.post.repostCount ?? 0,
        })
      ),
  };
}
