const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export function getYouTubeAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${YOUTUBE_AUTH_URL}?${params}`;
}

export async function exchangeYouTubeCode(code: string, redirectUri: string) {
  const res = await fetch(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  return res.json();
}

export async function refreshYouTubeToken(refreshToken: string) {
  const res = await fetch(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

export async function fetchYouTubeData(accessToken: string) {
  // Get channel info
  const channelRes = await fetch(
    `${YOUTUBE_API_BASE}/channels?part=snippet,contentDetails&mine=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const channelData = await channelRes.json();
  const channel = channelData.items?.[0];
  if (!channel) return null;

  const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

  // Get latest videos
  const videosRes = await fetch(
    `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const videosData = await videosRes.json();

  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
    channelThumbnail: channel.snippet.thumbnails?.default?.url,
    videos: (videosData.items ?? []).map((item: { snippet: { resourceId: { videoId: string }; title: string; thumbnails?: { medium?: { url: string } } } }) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
    })),
  };
}
