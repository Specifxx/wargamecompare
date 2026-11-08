import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { footerSisters } from "../src/lib/family-network";

// Owner, 2026-11-03: no sister-site list in the footer (a mesh of unrelated sites reads as a link network),
// only one link to the network page that lists every site (lib/family-network.ts, DECISIONS.md).
test("footer: no sister list, one internal link to /our-sites", () => {
  assert.deepEqual(footerSisters("wargame"), []);
  const footer = readFileSync(new URL("../src/components/Footer.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(footer, /footerSisters|Sister sites/);
  // 2026-11-08: one internal link to /our-sites, which lists every other family site once.
  assert.doesNotMatch(footer, /NETWORK_PAGE/);
  assert.match(footer, /href="\/our-sites"/);
  assert.doesNotMatch(readFileSync(new URL("../src/app/(site)/our-sites/page.tsx", import.meta.url), "utf8"), /nofollow|sponsored/);
});
