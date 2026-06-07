"use client";

import { useEffect } from "react";

type Props = { postId: string; destinationUrl: string };

export function RedirectBridge({ postId, destinationUrl }: Props) {
  useEffect(() => {
    const track = () => {
      const body = JSON.stringify({ post_id: postId });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/clicks", new Blob([body], { type: "application/json" }));
          return;
        }
      } catch {}
      fetch("/api/clicks", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
    };
    track();
    const timer = window.setTimeout(() => {
      if (destinationUrl.startsWith("https://")) window.location.replace(destinationUrl);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [postId, destinationUrl]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-center text-graphite">
      <div>
        <h1 className="text-2xl font-bold">Opening...</h1>
        <p className="mt-3 text-gray-500">If you are not redirected, <a className="font-bold text-orange-600 underline" href={destinationUrl}>open link</a>.</p>
      </div>
    </main>
  );
}
