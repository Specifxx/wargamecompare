"use client";

import { useEffect, useState } from "react";
import { isRegion, regionFromTimeZone, X_DEFAULT_REGION, type Region } from "@/lib/regions";

/**
 * The visitor's region on a page that has none of its own (the landing page, About, the legal pages, a 404): the server's HTML is
 * built for X_DEFAULT_REGION and the browser moves it to the region its time zone suggests. Nothing is sent anywhere and nothing
 * redirects: the page stays one CDN copy for everyone.
 */
export function useSoftRegion(): Region {
  const [r, setR] = useState<Region>(X_DEFAULT_REGION);
  useEffect(() => {
    try {
      // The region HOME_REGION_SCRIPT chose before paint (a pick, else the time zone), so the menu matches the tiles shown.
      const hr = document.documentElement.getAttribute("data-hr");
      if (isRegion(hr)) return setR(hr);
      const tz = regionFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (tz) setR(tz);
    } catch {
      /* keep the default */
    }
  }, []);
  return r;
}
