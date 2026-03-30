export async function fetchSoundCloudData(profileUrl: string) {
  // Use oEmbed API to get embed data
  const oembedRes = await fetch(
    `https://soundcloud.com/oembed?url=${encodeURIComponent(profileUrl)}&format=json`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (!oembedRes.ok) return null;

  const oembed = await oembedRes.json();

  // Extract username from URL
  const username = profileUrl.replace(/https?:\/\/soundcloud\.com\//, "").split("/")[0];

  return {
    username,
    profileUrl,
    title: oembed.title,
    description: oembed.description ?? null,
    thumbnailUrl: oembed.thumbnail_url ?? null,
    authorName: oembed.author_name,
    authorUrl: oembed.author_url,
    embedHtml: oembed.html,
  };
}
