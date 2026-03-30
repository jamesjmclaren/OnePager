export async function fetchRedditData(username: string) {
  const res = await fetch(
    `https://www.reddit.com/user/${username}/submitted.json?limit=5&raw_json=1`,
    {
      headers: { "User-Agent": "OnePager/1.0" },
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) return null;

  const data = await res.json();

  const aboutRes = await fetch(
    `https://www.reddit.com/user/${username}/about.json?raw_json=1`,
    {
      headers: { "User-Agent": "OnePager/1.0" },
      signal: AbortSignal.timeout(10000),
    }
  );
  const aboutData = aboutRes.ok ? await aboutRes.json() : null;

  const posts = (data?.data?.children ?? []).map(
    (child: {
      data: {
        id: string;
        title: string;
        subreddit_name_prefixed: string;
        score: number;
        num_comments: number;
        permalink: string;
        created_utc: number;
      };
    }) => ({
      id: child.data.id,
      title: child.data.title,
      subreddit: child.data.subreddit_name_prefixed,
      score: child.data.score,
      comments: child.data.num_comments,
      url: `https://reddit.com${child.data.permalink}`,
      createdAt: new Date(child.data.created_utc * 1000).toISOString(),
    })
  );

  return {
    username,
    karma: aboutData?.data?.link_karma ?? 0,
    commentKarma: aboutData?.data?.comment_karma ?? 0,
    icon: aboutData?.data?.icon_img ?? null,
    posts,
  };
}
