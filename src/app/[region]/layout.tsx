import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HolidayStrip } from "@/components/HolidayStrip";
import { DockAds } from "@/components/DockAds";
import { InlineAds } from "@/components/InlineAds";
import { SideNav } from "@/components/SideNav";
import { navGroups } from "@/lib/nav";
import { liveHubs } from "@/lib/nav-live";
import { adTilesFor } from "@/lib/inline-tiles";
import { isRegion } from "@/lib/regions";

export default function RegionLayout({ children, params }: { children: React.ReactNode; params: { region: string } }) {
  if (!isRegion(params.region)) notFound();
  const region = params.region;
  // The page's one ad block (owner, 2026-11-13) and the phone dock's tiles: popular kits and today's deals with a live eBay listing.
  const tiles = adTilesFor(region);
  return (
    <>
      <Header region={region} />
      <HolidayStrip region={region} />
      {/* From xl, the sidebar fills the wide screen's left side; the page keeps its own width beside it. */}
      <div className="mx-auto flex w-full max-w-shell flex-1">
        <SideNav region={region} groups={navGroups(region, liveHubs(region))} />
        <main id="main" className="min-w-0 flex-1">
          {children}
          <div className="page mt-12" data-ad-slot="">
            <InlineAds tiles={tiles} />
          </div>
        </main>
      </div>
      <Footer region={region} />
      {/* The phone dock (the side rails are gone, owner 2026-11-13): eBay tiles along the foot of a narrow screen, after a scroll. */}
      <DockAds tiles={tiles} />
    </>
  );
}
