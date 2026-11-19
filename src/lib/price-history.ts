// PRICE HISTORY (2026-11-19; agent reassignment job C, "price history gaps on the top pages"). Each daily import records,
// per market and product, the cheapest IN-STOCK price at one of our stores: the same number as the page's "Best price" and
// the alert feed's (Summary.best), never eBay, Amazon or Wayland, never converted. 0 means no store had it in stock that day.
//
// data/history.json keeps only the CHANGES: per market and product, [day, cents] pairs where day counts from EPOCH and a
// pair is written only when the price differs from the last one. Games Workshop prices barely move, so the file grows
// slowly while every function still bundles it (data/*.json, next.config.js). The first 22 days were filled from the
// committed data/offers.json of each daily import since launch (scripts/backfill-history.ts): our own records, not estimates.
//
// Pure (no data read): tests/price-history.test.ts checks it directly.
import type { Market } from "./regions";
import type { Offer } from "./types";

/** Day 0: the first import (2026-10-28). */
export const EPOCH = "2026-10-28";
/** The chart's window: about three months. */
export const CHART_DAYS = 90;

export interface HistoryFile {
  v: 1;
  /** The last day recorded, ISO. */
  last: string | null;
  m: Partial<Record<Market, Record<string, [number, number][]>>>;
}

export function emptyHistory(): HistoryFile {
  return { v: 1, last: null, m: {} };
}

export function dayIndex(iso: string): number {
  return Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${EPOCH}T00:00:00Z`)) / 86_400_000);
}
export function dayIso(index: number): string {
  return new Date(Date.parse(`${EPOCH}T00:00:00Z`) + index * 86_400_000).toISOString().slice(0, 10);
}

/** The day's headline price: the cheapest in-stock offer from a store still in the registry, cents, or 0. */
export function cheapestInStock(offers: readonly Offer[], known: (store: string) => boolean): number {
  let best = 0;
  for (const o of offers) if (o.in && o.p > 0 && known(o.s) && (best === 0 || o.p < best)) best = o.p;
  return best;
}

/**
 * Record one day's offers. A product that had a price and is missing from today's file gets a 0 (not listed in stock);
 * one never seen in stock is not added until it is. Days must be recorded in order: an older day than `last` is ignored.
 */
export function recordDay(
  file: HistoryFile,
  day: string,
  offers: Partial<Record<Market, Record<string, Offer[]>>>,
  known: (store: string) => boolean,
): HistoryFile {
  if (file.last && day <= file.last) return file;
  const d = dayIndex(day);
  if (d < 0) return file;
  for (const market of Object.keys(offers) as Market[]) {
    const series = (file.m[market] ??= {});
    const today = offers[market] ?? {};
    const ids = new Set([...Object.keys(series), ...Object.keys(today)]);
    for (const id of ids) {
      const cents = cheapestInStock(today[id] ?? [], known);
      const s = series[id];
      if (!s) {
        if (cents > 0) series[id] = [[d, cents]];
        continue;
      }
      if (s[s.length - 1][1] !== cents) s.push([d, cents]);
    }
  }
  file.last = day;
  return file;
}

export interface HistoryPoint {
  day: string;
  /** Cents; null on a day no store had it in stock. */
  cents: number | null;
}

/** One product's daily series in a market, from its first recorded day (or `days` back) to the file's last day. */
export function seriesFor(file: HistoryFile, market: Market, id: string, days = CHART_DAYS): HistoryPoint[] {
  const s = file.m[market]?.[id];
  if (!s?.length || !file.last) return [];
  const end = dayIndex(file.last);
  const start = Math.max(s[0][0], end - days + 1);
  const out: HistoryPoint[] = [];
  let i = 0;
  let cur = 0;
  for (let d = s[0][0]; d <= end; d++) {
    while (i < s.length && s[i][0] <= d) cur = s[i++][1];
    if (d >= start) out.push({ day: dayIso(d), cents: cur > 0 ? cur : null });
  }
  return out;
}

export interface HistoryStats {
  low: HistoryPoint;
  high: HistoryPoint;
  first: HistoryPoint;
  last: HistoryPoint;
  /** Days with an in-stock price. */
  priced: number;
}

/** Low, high, first and last priced points; null when fewer than two days carry a price (nothing to chart). */
export function historyStats(points: readonly HistoryPoint[]): HistoryStats | null {
  const priced = points.filter((p) => p.cents != null);
  if (priced.length < 2) return null;
  let low = priced[0];
  let high = priced[0];
  for (const p of priced) {
    if (p.cents! < low.cents!) low = p;
    if (p.cents! > high.cents!) high = p;
  }
  return { low, high, first: priced[0], last: priced[priced.length - 1], priced: priced.length };
}
