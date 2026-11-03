"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isRegion, REGION_KEY, regionFromTimeZone, X_DEFAULT_REGION, type Region } from "@/lib/regions";

// A region the visitor picks on a page with no region of its own (the landing page's chips, the header's switcher, the phone
// menu's tiles): one value for the whole page, so the header, the sidebar, the menu and the landing blocks all move together, and
// remembered the way the region pages remember it (lib/region-boot.ts, the same key).
let picked: Region | null = null;
const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Choose a region in place (no navigation): every component on the page that follows the visitor's region moves to it. */
export function pickRegion(region: Region) {
  picked = region;
  try {
    localStorage.setItem(REGION_KEY, region);
  } catch {
    /* storage blocked */
  }
  // The landing page's per-region blocks (HOME_REGION_SCRIPT, lib/regions.ts) follow the same attribute.
  document.documentElement.setAttribute("data-hr", region);
  listeners.forEach((fn) => fn());
}

/**
 * The visitor's region on a page that has none of its own (the landing page, About, the legal pages, a 404): the server's HTML is
 * built for X_DEFAULT_REGION and the browser moves it to the region they picked before, else the one their time zone suggests.
 * Nothing is sent anywhere and nothing redirects: the page stays one CDN copy for everyone.
 */
export function useSoftRegion(): Region {
  const chosen = useSyncExternalStore(subscribe, () => picked, () => null);
  const [r, setR] = useState<Region>(X_DEFAULT_REGION);
  useEffect(() => {
    try {
      // The region HOME_REGION_SCRIPT chose before paint (a pick, else the time zone), so the menu matches the blocks shown.
      const hr = document.documentElement.getAttribute("data-hr");
      if (isRegion(hr)) return setR(hr);
      const tz = regionFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (tz) setR(tz);
    } catch {
      /* keep the default */
    }
  }, []);
  return chosen ?? r;
}
