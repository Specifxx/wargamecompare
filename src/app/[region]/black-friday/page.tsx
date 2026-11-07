import { HolidayDealsPage, holidayMetadata } from "@/components/HolidayDealsPage";

// The Black Friday page (DECISIONS.md, "Black Friday page", 2026-11-02; "Black Friday strip and Cyber Monday page", 2026-11-07).
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { region: string } }) {
  return holidayMetadata("black-friday", params.region);
}

export default function BlackFridayPage({ params }: { params: { region: string } }) {
  return <HolidayDealsPage event="black-friday" region={params.region} />;
}
