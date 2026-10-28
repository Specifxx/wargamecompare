import type { Region } from "@/lib/regions";
import { HeaderBar } from "./HeaderBar";
import { SoftHeader } from "./SoftHeader";

// One row: menu (below xl), logo, search, the sections, region and theme. No cookie, header or session is read: one CDN copy per
// URL. A page with no region (region null) gets the same header for the visitor's region, moved in the browser (SoftHeader).
export function Header({ region }: { region: Region | null }) {
  return region ? <HeaderBar region={region} home={`/${region}`} /> : <SoftHeader />;
}
