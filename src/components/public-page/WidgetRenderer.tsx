"use client";

import { YouTubeEmbed } from "@/components/embeds/YouTubeEmbed";
import { TwitterEmbed } from "@/components/embeds/TwitterEmbed";
import { TwitchEmbed } from "@/components/embeds/TwitchEmbed";
import { GitHubEmbed } from "@/components/embeds/GitHubEmbed";
import { BlueskyEmbed } from "@/components/embeds/BlueskyEmbed";
import { CustomLinkEmbed } from "@/components/embeds/CustomLinkEmbed";
import { SubstackEmbed } from "@/components/embeds/SubstackEmbed";
import { MediumEmbed } from "@/components/embeds/MediumEmbed";
import { RedditEmbed } from "@/components/embeds/RedditEmbed";
import { DiscordEmbed } from "@/components/embeds/DiscordEmbed";
import { KickEmbed } from "@/components/embeds/KickEmbed";
import { MastodonEmbed } from "@/components/embeds/MastodonEmbed";
import { SoundCloudEmbed } from "@/components/embeds/SoundCloudEmbed";
import { SpotifyEmbed } from "@/components/embeds/SpotifyEmbed";

interface Widget {
  type: string;
  data: Record<string, unknown>;
}

interface WidgetRendererProps {
  widgets: Widget[];
  layoutMode?: "single" | "grid";
}

export function WidgetRenderer({ widgets, layoutMode = "single" }: WidgetRendererProps) {
  const containerClass =
    layoutMode === "grid"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
      : "space-y-6";

  return (
    <div className={containerClass}>
      {widgets.map((widget, i) => {
        // Section headers span full width in grid mode
        if (widget.type === "header") {
          const label = (widget.data?.label as string) ?? widget.data?.toString() ?? "";
          return (
            <div
              key={`header-${i}`}
              className={layoutMode === "grid" ? "col-span-full" : ""}
            >
              <h2
                className="text-xl font-bold mt-2 mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {label}
              </h2>
              <hr style={{ borderColor: "var(--card-border)" }} />
            </div>
          );
        }

        const rendered = renderWidget(widget, i);
        return rendered ? <div key={i}>{rendered}</div> : null;
      })}
    </div>
  );
}

function renderWidget(widget: Widget, _index: number) {
  const d = widget.data;

  switch (widget.type) {
    case "youtube": {
      const videos =
        (d.videos as Array<{ videoId: string; title: string }>) ?? [];
      const latestVideo = videos[0];
      if (!latestVideo) return null;
      return (
        <YouTubeEmbed videoId={latestVideo.videoId} title={latestVideo.title} />
      );
    }

    case "twitter": {
      const tweets = (d.tweets as Array<{ id: string }>) ?? [];
      return (
        <div className="space-y-4">
          {tweets.slice(0, 3).map((tweet) => (
            <TwitterEmbed key={tweet.id} tweetId={tweet.id} />
          ))}
        </div>
      );
    }

    case "twitch":
      return (
        <TwitchEmbed
          channelName={d.login as string}
          isLive={d.isLive as boolean}
          streamTitle={d.streamTitle as string | null}
          gameName={d.gameName as string | null}
          viewerCount={d.viewerCount as number}
        />
      );

    case "github":
      return (
        <GitHubEmbed
          username={d.username as string}
          name={d.name as string | null}
          bio={d.bio as string | null}
          avatarUrl={d.avatarUrl as string}
          profileUrl={d.profileUrl as string}
          publicRepos={d.publicRepos as number}
          followers={d.followers as number}
          repos={
            d.repos as Array<{
              name: string;
              description: string | null;
              url: string;
              stars: number;
              language: string | null;
            }>
          }
        />
      );

    case "bluesky":
      return (
        <BlueskyEmbed
          handle={d.handle as string}
          displayName={d.displayName as string}
          avatar={d.avatar as string | null}
          followersCount={d.followersCount as number}
          postsCount={d.postsCount as number}
          posts={
            d.posts as Array<{
              uri: string;
              text: string;
              createdAt: string;
              likes: number;
              reposts: number;
            }>
          }
        />
      );

    case "custom_link":
      return (
        <CustomLinkEmbed
          url={d.url as string}
          title={d.title as string}
          description={d.description as string | null}
          image={d.image as string | null}
          favicon={d.favicon as string | null}
        />
      );

    case "substack":
      return (
        <SubstackEmbed
          title={d.title as string}
          description={d.description as string | null}
          link={d.link as string}
          image={d.image as string | null}
          posts={
            d.posts as Array<{
              title: string;
              link: string;
              pubDate: string;
              excerpt: string;
            }>
          }
        />
      );

    case "medium":
      return (
        <MediumEmbed
          title={d.title as string}
          link={d.link as string}
          articles={
            d.articles as Array<{
              title: string;
              link: string;
              pubDate: string;
              excerpt: string;
            }>
          }
        />
      );

    case "reddit":
      return (
        <RedditEmbed
          username={d.username as string}
          karma={d.karma as number}
          icon={d.icon as string | null}
          posts={
            d.posts as Array<{
              id: string;
              title: string;
              subreddit: string;
              score: number;
              comments: number;
              url: string;
              createdAt: string;
            }>
          }
        />
      );

    case "discord":
      return (
        <DiscordEmbed
          serverId={d.serverId as string}
          name={d.name as string}
          instantInvite={d.instantInvite as string | null}
          presenceCount={d.presenceCount as number}
        />
      );

    case "kick":
      return (
        <KickEmbed
          username={d.username as string}
          displayName={d.displayName as string}
          profileImage={d.profileImage as string | null}
          isLive={d.isLive as boolean}
          streamTitle={d.streamTitle as string | null}
          gameName={d.gameName as string | null}
          viewerCount={d.viewerCount as number}
        />
      );

    case "mastodon":
      return (
        <MastodonEmbed
          handle={d.handle as string}
          displayName={d.displayName as string}
          avatar={d.avatar as string | null}
          followersCount={d.followersCount as number}
          statusesCount={d.statusesCount as number}
          profileUrl={d.profileUrl as string}
          posts={
            d.posts as Array<{
              id: string;
              text: string;
              createdAt: string;
              favourites: number;
              reblogs: number;
              url: string;
            }>
          }
        />
      );

    case "soundcloud":
      return (
        <SoundCloudEmbed
          username={d.username as string}
          profileUrl={d.profileUrl as string}
          authorName={d.authorName as string}
          thumbnailUrl={d.thumbnailUrl as string | null}
        />
      );

    case "spotify":
      return (
        <SpotifyEmbed
          topTracks={
            d.topTracks as Array<{
              id: string;
              name: string;
              artist: string;
              albumArt: string;
            }>
          }
          currentlyPlaying={d.currentlyPlaying as { id: string; name: string; artist: string; albumArt: string } | null}
        />
      );

    case "header":
      return null; // Headers are handled separately in layouts

    default:
      return null;
  }
}
