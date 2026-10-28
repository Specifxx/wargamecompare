"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { REGIONS, regionFromTimeZone, type Region } from "@/lib/regions";

/** Suggest a country from the browser's time zone. Nothing redirects, nothing is sent anywhere. */
export function RegionSuggest() {
  const [r, setR] = useState<Region | null>(null);
  useEffect(() => {
    try {
      setR(regionFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone));
    } catch {
      /* no suggestion */
    }
  }, []);
  if (!r) return <div className="mt-6 h-12" />;
  return (
    <div className="mt-6 h-12">
      <Link href={`/${r}`} className="btn-primary h-12 px-6 text-base">
        Compare prices in {REGIONS[r].inName} →
      </Link>
    </div>
  );
}
