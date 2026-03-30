export async function fetchLinkMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "OnePager Bot/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return { url, title: url, description: null, image: null };

    const html = await res.text();

    const getMetaContent = (property: string) => {
      const match = html.match(
        new RegExp(
          `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
          "i"
        )
      );
      if (match) return match[1];
      // Try reversed attribute order
      const match2 = html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
          "i"
        )
      );
      return match2?.[1] ?? null;
    };

    const title =
      getMetaContent("og:title") ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
      url;

    const description =
      getMetaContent("og:description") ??
      getMetaContent("description");

    const image = getMetaContent("og:image");

    // Extract favicon
    const faviconMatch = html.match(
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i
    );
    const favicon = faviconMatch
      ? new URL(faviconMatch[1], url).href
      : new URL("/favicon.ico", url).href;

    return { url, title, description, image, favicon };
  } catch {
    return { url, title: url, description: null, image: null, favicon: null };
  }
}
