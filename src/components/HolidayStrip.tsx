import Link from "@/components/Link";
import { saleStrip } from "@/lib/black-friday";
import { REGIONS, type Region } from "@/lib/regions";

// One line under the header on every region page from 1 November to the day after Cyber Monday, linking that region's Black
// Friday page, then its Cyber Monday page (lib/black-friday.ts saleStrip; DECISIONS.md, "Black Friday strip and Cyber Monday
// page", 2026-11-07). A plain link in the server HTML: never a pop-up, a countdown or "ends soon".
export function HolidayStrip({ region, today = new Date().toISOString().slice(0, 10) }: { region: Region; today?: string }) {
  const s = saleStrip(today);
  if (!s) return null;
  return (
    <div className="border-b border-line bg-brand-soft" data-holiday-strip={s.event}>
      <p className="page truncate py-1.5 text-center text-xs sm:text-sm">
        <Link href={`/${region}/${s.event}`} className="hover:text-ink">
          <b>{s.name} deals in {REGIONS[region].inName}</b><span className="hidden sm:inline"> · kits and paints under RRP today</span> · <span className="font-semibold text-brand-strong">see the deals →</span>
        </Link>
      </p>
    </div>
  );
}
