"use client";

import { HeaderBar } from "./HeaderBar";
import { useSoftRegion } from "./SoftRegion";

/** The header on a page with no region of its own: the whole navigation, for the visitor's region (SoftRegion.tsx). */
export function SoftHeader() {
  return <HeaderBar region={useSoftRegion()} home="/" />;
}
