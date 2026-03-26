"use client";

import { useEffect, useRef } from "react";

interface TwitterEmbedProps {
  tweetId: string;
}

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

export function TwitterEmbed({ tweetId }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadWidget = () => {
      if (window.twttr && containerRef.current) {
        containerRef.current.innerHTML = "";
        window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: "light",
          conversation: "none",
        });
      }
    };

    if (window.twttr) {
      loadWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = loadWidget;
    document.head.appendChild(script);
  }, [tweetId]);

  return (
    <div ref={containerRef} className="min-h-[200px]">
      <div className="animate-pulse rounded-lg bg-gray-100 p-4">
        Loading tweet...
      </div>
    </div>
  );
}
