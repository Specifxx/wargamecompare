"use client";

import { navGroups } from "@/lib/nav";
import { SideNav } from "./SideNav";
import { useSoftRegion } from "./SoftRegion";

/** The sidebar on a page with no region of its own, for the visitor's region. */
export function SoftSideNav() {
  const region = useSoftRegion();
  return <SideNav region={region} groups={navGroups(region)} />;
}
