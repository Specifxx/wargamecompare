import { HolidayDealsPage, holidayMetadata } from "@/components/HolidayDealsPage";

// The Cyber Monday page (DECISIONS.md, "Black Friday page", 2026-11-02; "Black Friday strip and Cyber Monday page", 2026-11-07).
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }) {
  return holidayMetadata("cyber-monday", params.region);
}

export default function CyberMondayPage({ params }: { params: { region: string } }) {
  return <HolidayDealsPage event="cyber-monday" region={params.region} />;
}
