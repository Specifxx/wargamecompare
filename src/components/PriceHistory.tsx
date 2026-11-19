// The product page's price history (lib/price-history.ts): the cheapest in-stock store price per day, drawn as a step line
// in plain server-rendered SVG (no client JS, no chart library). A day no store had it in stock breaks the line.
import { historyStats, type HistoryPoint } from "@/lib/price-history";
import { formatPrice, type Region } from "@/lib/regions";

const W = 640;
const H = 170;
const PAD = { l: 8, r: 8, t: 12, b: 12 };

function shortDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function PriceHistory({ points, region }: { points: HistoryPoint[]; region: Region }) {
  const stats = historyStats(points);
  if (!stats) return null;
  const lo = stats.low.cents!;
  const hi = stats.high.cents!;
  const span = Math.max(hi - lo, Math.round(hi * 0.05), 1);
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;
  const n = points.length;
  const x = (i: number) => PAD.l + (n === 1 ? 0 : (i / (n - 1)) * (W - PAD.l - PAD.r));
  const y = (c: number) => PAD.t + (1 - (c - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);

  // Step segments: each priced day runs flat to the next day; an unpriced day starts a new path.
  const paths: string[] = [];
  let d = "";
  points.forEach((p, i) => {
    if (p.cents == null) {
      if (d) paths.push(d);
      d = "";
      return;
    }
    const yy = y(p.cents).toFixed(1);
    d += d ? ` H${x(i).toFixed(1)} V${yy}` : `M${x(i).toFixed(1)} ${yy}`;
    if (i === n - 1 || points[i + 1].cents == null) d += ` H${x(Math.min(i + 1, n - 1)).toFixed(1)}`;
  });
  if (d) paths.push(d);

  const lowIdx = points.indexOf(stats.low);
  const change = stats.last.cents! - stats.first.cents!;
  const changeText =
    change === 0 ? "unchanged" : `${change < 0 ? "down" : "up"} ${formatPrice(Math.abs(change), region)} (${Math.round((Math.abs(change) / stats.first.cents!) * 100)}%)`;

  return (
    <div className="card p-4 sm:p-5">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-faint">Latest</dt>
          <dd className="tabular font-bold">{formatPrice(stats.last.cents!, region)}</dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Lowest</dt>
          <dd className="tabular font-bold text-open">
            {formatPrice(lo, region)} <span className="font-normal text-faint">· {shortDay(stats.low.day)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Highest</dt>
          <dd className="tabular font-bold">
            {formatPrice(hi, region)} <span className="font-normal text-faint">· {shortDay(stats.high.day)}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-faint">Since {shortDay(stats.first.day)}</dt>
          <dd className="tabular font-bold">{changeText}</dd>
        </div>
      </dl>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full text-brand" role="img" aria-label={`Cheapest in-stock price from ${shortDay(points[0].day)} to ${shortDay(points[n - 1].day)}: lowest ${formatPrice(lo, region)}, highest ${formatPrice(hi, region)}, latest ${formatPrice(stats.last.cents!, region)}.`}>
        <line x1={PAD.l} x2={W - PAD.r} y1={y(lo)} y2={y(lo)} stroke="rgb(var(--line))" strokeDasharray="4 4" />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(hi)} y2={y(hi)} stroke="rgb(var(--line))" strokeDasharray="4 4" />
        {paths.map((p, i) => (
          <path key={i} d={p} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ))}
        <circle cx={x(lowIdx)} cy={y(lo)} r={4} fill="rgb(var(--open))" />
      </svg>
      <div className="flex justify-between text-xs text-faint" aria-hidden="true">
        <span>{shortDay(points[0].day)}</span>
        <span>{shortDay(points[n - 1].day)}</span>
      </div>
      <p className="mt-2 text-xs text-faint">
        The cheapest in-stock price at the stores we compare, recorded at each daily price check (a day the check did not run keeps the day before&rsquo;s price). Gaps are days no store had it in stock. eBay and Amazon are not counted.
      </p>
    </div>
  );
}
