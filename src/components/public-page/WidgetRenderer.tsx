"use client";

import { YouTubeEmbed } from "@/components/embeds/YouTubeEmbed";
import { TwitterEmbed } from "@/components/embeds/TwitterEmbed";
import { TwitchEmbed } from "@/components/embeds/TwitchEmbed";

interface Widget {
  type: "youtube" | "twitter" | "twitch";
  data: Record<string, unknown>;
}

interface WidgetRendererProps {
  widgets: Widget[];
}

export function WidgetRenderer({ widgets }: WidgetRendererProps) {
  return (
    <div className="space-y-6">
      {widgets.map((widget, i) => {
        switch (widget.type) {
          case "youtube": {
            const videos = (widget.data.videos as Array<{ videoId: string; title: string }>) ?? [];
            const latestVideo = videos[0];
            if (!latestVideo) return null;
            return (
              <div key={i}>
                <YouTubeEmbed
                  videoId={latestVideo.videoId}
                  title={latestVideo.title}
                />
              </div>
            );
          }
          case "twitter": {
            const tweets = (widget.data.tweets as Array<{ id: string }>) ?? [];
            return (
              <div key={i} className="space-y-4">
                {tweets.slice(0, 3).map((tweet) => (
                  <TwitterEmbed key={tweet.id} tweetId={tweet.id} />
                ))}
              </div>
            );
          }
          case "twitch": {
            return (
              <div key={i}>
                <TwitchEmbed
                  channelName={widget.data.login as string}
                  isLive={widget.data.isLive as boolean}
                  streamTitle={widget.data.streamTitle as string | null}
                  gameName={widget.data.gameName as string | null}
                  viewerCount={widget.data.viewerCount as number}
                />
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
