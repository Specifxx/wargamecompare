import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SoftDockAds } from "@/components/DockAds";
import { SoftInlineAds } from "@/components/InlineAds";
import { SoftSideNav } from "@/components/SideNav";
import { adTilesFor } from "@/lib/inline-tiles";
import type { AdTiles } from "@/lib/inline-ads";
import { navGroups } from "@/lib/nav";
import { liveHubs } from "@/lib/nav-live";
import { REGIONS, X_DEFAULT_REGION, type Region } from "@/lib/regions";

// The pages with no region of their own (the landing page, About, the legal pages) get the whole navigation too (owner,
// 2026-10-28): the header, the phone menu and, from xl, the sidebar, for the visitor's region (built for the US on the server
// and retargeted in the browser: SideNav.tsx SoftSideNav).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // Every region's tiles, computed on the server; the visitor's region is picked in the browser (SoftRegion.tsx).
  const all = Object.fromEntries((Object.keys(REGIONS) as Region[]).map((r) => [r, adTilesFor(r)])) as Record<Region, AdTiles>;
  return (
    <>
      <Header region={null} />
      <div className="mx-auto flex w-full max-w-shell flex-1">
        <SoftSideNav built={X_DEFAULT_REGION} groups={navGroups(X_DEFAULT_REGION, liveHubs(null))} />
        <main id="main" className="min-w-0 flex-1">
          {children}
          <div className="page mt-12" data-ad-slot="">
            <SoftInlineAds all={all} />
          </div>
        </main>
      </div>
      <Footer region={null} />
      {/* The phone dock (the side rails are gone, owner 2026-11-13), in the visitor's region. */}
      <SoftDockAds all={all} />
    </>
  );
}
