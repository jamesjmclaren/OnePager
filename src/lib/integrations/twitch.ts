const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/authorize";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const TWITCH_API_BASE = "https://api.twitch.tv/helix";

export function getTwitchAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user:read:email",
    state,
  });
  return `${TWITCH_AUTH_URL}?${params}`;
}

export async function exchangeTwitchCode(code: string, redirectUri: string) {
  const res = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  return res.json();
}

export async function refreshTwitchToken(refreshToken: string) {
  const res = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

export async function fetchTwitchData(accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Client-Id": process.env.TWITCH_CLIENT_ID!,
  };

  // Get user info
  const userRes = await fetch(`${TWITCH_API_BASE}/users`, { headers });
  const userData = await userRes.json();
  const user = userData.data?.[0];
  if (!user) return null;

  // Check stream status
  const streamRes = await fetch(
    `${TWITCH_API_BASE}/streams?user_id=${user.id}`,
    { headers }
  );
  const streamData = await streamRes.json();
  const stream = streamData.data?.[0];

  return {
    userId: user.id,
    login: user.login,
    displayName: user.display_name,
    profileImage: user.profile_image_url,
    isLive: !!stream,
    streamTitle: stream?.title ?? null,
    gameName: stream?.game_name ?? null,
    viewerCount: stream?.viewer_count ?? 0,
  };
}
