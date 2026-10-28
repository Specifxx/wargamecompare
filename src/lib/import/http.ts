// Outbound HTTP for the importer (GitHub Actions only; the website never fetches a store). Ported from Rift Compare's
// scrape-http.ts: a browser User-Agent, robots.txt honoured, and backoff on 429 (Shopify throttles by IP across all of
// its storefronts, which is why the importer reads two stores at a time).
const HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class RateLimitedError extends Error {}
const RETRY_WAITS_MS = [10_000, 30_000];

/** GET a URL: parsed JSON (or text), null on failure; throws on a persistent 429 so the caller stops on that store. */
export async function get(url: string, accept: "json" | "text" = "json"): Promise<unknown> {
  let res: Response | null = null;
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch(url, { headers: HEADERS, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    } catch {
      if (attempt >= 1) return null;
      await sleep(3000);
      continue;
    }
    if (res.status !== 429 && res.status < 500) break;
    if (attempt >= RETRY_WAITS_MS.length) {
      if (res.status === 429) throw new RateLimitedError(`429 from ${new URL(url).host}`);
      return null;
    }
    const after = Number(res.headers.get("retry-after"));
    await sleep(Number.isFinite(after) && after > 0 ? Math.min(after * 1000, 60_000) : RETRY_WAITS_MS[attempt]);
  }
  if (!res || !res.ok) return null;
  try {
    return accept === "json" ? await res.json() : await res.text();
  } catch {
    return null;
  }
}

interface RobotsRules {
  disallow: string[];
  allow: string[];
}
const robotsCache = new Map<string, Promise<RobotsRules | null>>();

async function fetchRobots(base: string): Promise<RobotsRules | null> {
  const text = (await get(`${base}/robots.txt`, "text").catch(() => null)) as string | null;
  if (!text) return null;
  const rules: RobotsRules = { disallow: [], allow: [] };
  let inWildcard = false;
  let sawWildcard = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "user-agent") {
      inWildcard = value === "*";
      if (inWildcard) sawWildcard = true;
      continue;
    }
    if (!inWildcard) continue;
    if (field === "disallow" && value) rules.disallow.push(value);
    if (field === "allow" && value) rules.allow.push(value);
  }
  return sawWildcard ? rules : null;
}

/** Whether a path may be read on this store. Fails OPEN on an unreadable robots.txt (as Rift Compare's does). */
export async function robotsAllows(base: string): Promise<(path: string) => boolean> {
  let pending = robotsCache.get(base);
  if (!pending) {
    pending = fetchRobots(base);
    robotsCache.set(base, pending);
  }
  const rules = await pending;
  if (!rules) return () => true;
  return (path: string) => {
    const longest = (list: string[]) => list.filter((p) => path.startsWith(p)).sort((a, b) => b.length - a.length)[0];
    const dis = longest(rules.disallow);
    if (!dis) return true;
    const allow = longest(rules.allow);
    return !!allow && allow.length >= dis.length;
  };
}
