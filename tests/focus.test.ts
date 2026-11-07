// The low-traction cull (lib/focus.ts, owner 2026-11-07): which products get a page, and where a culled URL goes.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { demandIds, focusCatalog } from "../src/lib/focus";
import type { Offer, Product } from "../src/lib/types";

const today = "2026-11-07";
const P = (id: string, firstSeen = "2026-11-01", type = "miniatures") => ({ id, name: id, system: null, faction: null, type, ean: null, codes: [], code: null, image: null, firstSeen }) as Product;
const O = (s: string, inStock = true, t = "Kit"): Offer => ({ s, p: 1000, in: inStock, u: "/x", t });

test("two in-stock stores in one region, a pre-order, a new arrival or search demand keep a page", () => {
  const products = [P("two", "2026-11-01"), P("split"), P("one"), P("none"), P("pre"), P("searched"), P("arrived", "2026-11-05")];
  const offers = {
    UK: { two: [O("a"), O("b")], split: [O("a")], one: [O("a"), O("b", false)], pre: [O("a", true, "Kit (Pre-Order 14/11/26)")], arrived: [O("a")] },
    US: { split: [O("b")] },
  };
  const { keep, culled } = focusCatalog(products, offers, new Set(["searched"]), today, "2026-11-01");
  assert.deepEqual([...keep].sort(), ["arrived", "pre", "searched", "two"]);
  assert.deepEqual([...culled.keys()].sort(), ["none", "one", "split"]);
  assert.equal(culled.get("one"), "miniatures");
});

test("demand is a click or ten impressions on a product page", () => {
  assert.deepEqual(demandIds({ "/au/p/a": [1, 1, 5], "/us/p/b": [0, 10, 9], "/uk/p/c": [0, 9, 9], "/au/type/paints": [3, 40, 2] }), ["a", "b"]);
});

test("the site reads only listed products, a culled URL 301s to its type, and the demand file ships", () => {
  assert.match(fs.readFileSync("src/lib/data.ts", "utf8"), /focusCatalog\(all, offers, demand/);
  const page = fs.readFileSync("src/app/[region]/p/[slug]/page.tsx", "utf8");
  assert.match(page, /permanentRedirect\(`\/\$\{r\.region\}\/type\/\$\{type\}`\)/);
  assert.match(fs.readFileSync("next.config.js", "utf8"), /\.\/data\/focus\/\*\.json/);
  assert.match(fs.readFileSync(".github/workflows/refresh-prices.yml", "utf8"), /scripts\/focus-demand\.ts/);
});
