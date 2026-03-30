import { XMLParser } from "fast-xml-parser";

export async function fetchSubstackData(publication: string) {
  const feedUrl = `https://${publication}.substack.com/feed`;
  const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;

  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);

  const channel = parsed?.rss?.channel;
  if (!channel) return null;

  const items = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];

  return {
    publication,
    title: channel.title,
    description: channel.description,
    link: channel.link,
    image: channel.image?.url ?? null,
    posts: items.slice(0, 5).map(
      (item: {
        title: string;
        link: string;
        pubDate: string;
        description?: string;
        "content:encoded"?: string;
      }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        excerpt: stripHtml(item.description ?? item["content:encoded"] ?? "").slice(0, 200),
      })
    ),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
