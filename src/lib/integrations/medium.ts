import { XMLParser } from "fast-xml-parser";

export async function fetchMediumData(username: string) {
  const feedUrl = `https://medium.com/feed/@${username}`;
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
    username,
    title: channel.title,
    description: channel.description,
    link: channel.link,
    image: channel.image?.url ?? null,
    articles: items.slice(0, 5).map(
      (item: {
        title: string;
        link: string;
        pubDate: string;
        "content:encoded"?: string;
        "dc:creator"?: string;
      }) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        author: item["dc:creator"] ?? username,
        excerpt: stripHtml(item["content:encoded"] ?? "").slice(0, 200),
      })
    ),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
