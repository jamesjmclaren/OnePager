export async function fetchDiscordData(serverId: string) {
  const res = await fetch(
    `https://discord.com/api/v10/guilds/${serverId}/widget.json`,
    { signal: AbortSignal.timeout(10000) }
  );

  if (!res.ok) return null;

  const data = await res.json();

  return {
    serverId,
    name: data.name,
    instantInvite: data.instant_invite,
    presenceCount: data.presence_count,
    channels: (data.channels ?? []).slice(0, 5).map(
      (c: { id: string; name: string; position: number }) => ({
        id: c.id,
        name: c.name,
        position: c.position,
      })
    ),
  };
}
