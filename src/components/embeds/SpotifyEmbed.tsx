"use client";

interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
}

interface SpotifyEmbedProps {
  topTracks: Track[];
  currentlyPlaying: Track | null;
}

export function SpotifyEmbed({ topTracks, currentlyPlaying }: SpotifyEmbedProps) {
  const trackToShow = currentlyPlaying ?? topTracks?.[0];
  if (!trackToShow) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      {currentlyPlaying && (
        <div className="bg-green-50 px-4 py-2 text-sm text-green-700 font-medium">
          Now Playing
        </div>
      )}
      <iframe
        src={`https://open.spotify.com/embed/track/${trackToShow.id}?utm_source=generator&theme=0`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="border-0"
      />
      {topTracks.length > 1 && !currentlyPlaying && (
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Top Tracks</p>
          {topTracks.slice(1, 4).map((track) => (
            <div key={track.id} className="flex items-center gap-3">
              <img src={track.albumArt} alt={track.name} className="h-8 w-8 rounded" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{track.name}</p>
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
