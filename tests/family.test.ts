import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { footerSisters } from "../src/lib/family-network";

// Owner, 2026-11-02: the footer's list of every site was "convoluted". It now names the hobby sisters only,
// then one link to the network page (lib/family-network.ts, DECISIONS.md "Sites that grow each other").
test("footer: the hobby sisters, then the network page, never this site itself", () => {
  assert.deepEqual(footerSisters("wargame").map((s) => s.url), ["https://gundamcompare.com", "https://figurecompare.com"]);
  const footer = readFileSync(new URL("../src/components/Footer.tsx", import.meta.url), "utf8");
  assert.match(footer, /footerSisters\("wargame"\)\.map/);
  assert.match(footer, /href=\{NETWORK_PAGE\}/);
  assert.doesNotMatch(footer, /nofollow|sponsored/);
});
