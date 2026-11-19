// Records today's cheapest in-stock store price per market and product into data/history.json (src/lib/price-history.ts).
// Runs in refresh-prices.yml right after the import, so the day's data commit carries it. The day is the import's own
// (data/meta.json updatedAt, UTC); a day already recorded is left alone, so a re-run is harmless.
import fs from "node:fs";
import path from "node:path";
import { emptyHistory, recordDay, type HistoryFile } from "../src/lib/price-history";
import { STORE_BY_KEY } from "../src/lib/stores";
import type { Meta, OffersFile } from "../src/lib/types";

const DATA = path.join(process.cwd(), "data");
const read = <T>(f: string, fallback: T): T => {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")) as T;
  } catch {
    return fallback;
  }
};

const meta = read<Meta>("meta.json", { updatedAt: "", stores: {}, products: 0 });
const offers = read<OffersFile>("offers.json", {});
const day = (meta.updatedAt || new Date().toISOString()).slice(0, 10);
const before = read<HistoryFile>("history.json", emptyHistory());
const last = before.last;
const after = recordDay(before, day, offers, (s) => STORE_BY_KEY.has(s));
fs.writeFileSync(path.join(DATA, "history.json"), JSON.stringify(after));
const series = Object.values(after.m).reduce((n, m) => n + Object.keys(m ?? {}).length, 0);
console.log(last === after.last ? `history: ${day} already recorded (last ${last})` : `history: recorded ${day}, ${series} series`);
