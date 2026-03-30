const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export function getSpotifyAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-read-currently-playing user-top-read",
    state,
  });
  return `${SPOTIFY_AUTH_URL}?${params}`;
}

export async function exchangeSpotifyCode(code: string, redirectUri: string) {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  return res.json();
}

export async function refreshSpotifyToken(refreshToken: string) {
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  return res.json();
}

export async function fetchSpotifyData(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Fetch top tracks
  const topTracksRes = await fetch(
    `${SPOTIFY_API_BASE}/me/top/tracks?limit=5&time_range=short_term`,
    { headers }
  );

  let topTracks: Array<{
    id: string;
    name: string;
    artist: string;
    albumArt: string;
  }> = [];

  if (topTracksRes.ok) {
    const topTracksData = await topTracksRes.json();
    topTracks = (topTracksData.items ?? []).map(
      (track: {
        id: string;
        name: string;
        artists: Array<{ name: string }>;
        album: { images: Array<{ url: string }> };
      }) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        albumArt: track.album.images?.[0]?.url ?? "",
      })
    );
  }

  // Fetch currently playing
  let currentlyPlaying = null;
  const nowPlayingRes = await fetch(
    `${SPOTIFY_API_BASE}/me/player/currently-playing`,
    { headers }
  );

  if (nowPlayingRes.ok && nowPlayingRes.status !== 204) {
    const nowData = await nowPlayingRes.json();
    if (nowData.is_playing && nowData.item) {
      currentlyPlaying = {
        id: nowData.item.id,
        name: nowData.item.name,
        artist: nowData.item.artists
          .map((a: { name: string }) => a.name)
          .join(", "),
        albumArt: nowData.item.album?.images?.[0]?.url ?? "",
      };
    }
  }

  // Get user profile for platform_user_id
  const profileRes = await fetch(`${SPOTIFY_API_BASE}/me`, { headers });
  const profile = profileRes.ok ? await profileRes.json() : null;

  return {
    userId: profile?.id ?? null,
    displayName: profile?.display_name ?? null,
    topTracks,
    currentlyPlaying,
  };
}
