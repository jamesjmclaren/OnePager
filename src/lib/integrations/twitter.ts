const TWITTER_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const TWITTER_API_BASE = "https://api.twitter.com/2";

export function getTwitterAuthUrl(redirectUri: string, state: string, codeChallenge: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "tweet.read users.read offline.access",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "plain",
  });
  return `${TWITTER_AUTH_URL}?${params}`;
}

export async function exchangeTwitterCode(
  code: string,
  redirectUri: string,
  codeVerifier: string
) {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  return res.json();
}

export async function refreshTwitterToken(refreshToken: string) {
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TWITTER_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

export async function fetchTwitterData(accessToken: string) {
  // Get user info
  const userRes = await fetch(`${TWITTER_API_BASE}/users/me?user.fields=profile_image_url,username`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const userData = await userRes.json();
  const user = userData.data;
  if (!user) return null;

  // Get recent tweets
  const tweetsRes = await fetch(
    `${TWITTER_API_BASE}/users/${user.id}/tweets?max_results=5&tweet.fields=created_at`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const tweetsData = await tweetsRes.json();

  return {
    userId: user.id,
    username: user.username,
    name: user.name,
    profileImage: user.profile_image_url,
    tweets: (tweetsData.data ?? []).map((tweet: { id: string; text: string; created_at?: string }) => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at,
    })),
  };
}
