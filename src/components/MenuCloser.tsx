"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The header's <details> menus (the phone menu and the country picker, `data-menu`) close when the visitor goes
 * somewhere: on a link tap inside one, on a tap outside one, and on every route change. Without it a client-side
 * navigation kept the phone menu open over the new page, so tapping "Warhammer 40,000", "Paints and tools" or
 * "Black Library novels" looked like it did nothing (visitor feedback, 2026-10-31). Renders nothing.
 */
export function MenuCloser() {
  const pathname = usePathname();
  useEffect(() => {
    closeAll();
  }, [pathname]);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const t = e.target as Element | null;
      const inMenu = t?.closest?.("details[data-menu]");
      for (const d of Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-menu][open]"))) {
        // A tap on a link (or the search button) inside a menu closes it; a tap anywhere else closes the others.
        if (d === inMenu && !t?.closest?.("a, button")) continue;
        if (d === inMenu && t?.closest?.("summary")) continue;
        d.open = false;
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}

function closeAll() {
  for (const d of Array.from(document.querySelectorAll<HTMLDetailsElement>("details[data-menu][open]"))) d.open = false;
}
