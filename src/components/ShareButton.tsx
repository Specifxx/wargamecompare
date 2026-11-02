"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { SITE_URL } from "@/lib/site";
import { shareUrl } from "@/lib/share-link";

// Share (owner, 2026-11-02: word of mouth): the phone's own share sheet (navigator.share) where there is one, else the
// link and message copied, with a short "Link copied" note. No pop-up, no reward. The link is the page's canonical URL
// plus utm_source=share (lib/share-link.ts); the message names the real price gap in the region. One Vercel event per
// tap, share { medium }; RiftCompare's growth report counts them.
export function ShareButton({ title, path, text, className = "" }: { title: string; path: string; text: string; className?: string }) {
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (t: string) => {
    setNote(t);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(""), 2500);
  };
  async function share() {
    const url = shareUrl(SITE_URL, path, "product");
    track("share", { medium: "product" });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      say("Link copied");
    } catch {
      say("Couldn’t copy the link");
    }
  }
  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      <button type="button" onClick={share} className="btn-ghost" aria-label={`Share ${title}`} title="Share">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
          <path d="M16 6l-4-4-4 4" />
          <path d="M12 2v13" />
        </svg>
        Share
      </button>
      <span role="status" aria-live="polite" className={`pointer-events-none absolute left-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-surface transition-opacity ${note ? "opacity-100" : "opacity-0"}`}>
        {note}
      </span>
    </span>
  );
}
