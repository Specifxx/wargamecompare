import { test } from "node:test";
import assert from "node:assert/strict";
import { SISTER_SITES } from "../src/lib/site";

// The footer links the whole Compare Empire family, once each, never itself, and
// (owner, 2026-11-02) never ties a sister site to one country: "Australian tech
// prices" was shown to US visitors of a site that compares US stores too.
test("family links: every sister site once, descriptive and region-neutral", () => {
  const urls = SISTER_SITES.map((s) => s.url);
  assert.equal(new Set(urls).size, urls.length, "no site twice");
  assert.ok(!urls.some((u) => u.includes("wargamecompare")), "never this site itself");
  assert.ok(urls.includes("https://cyberpunkcompare.com"));
  for (const s of SISTER_SITES) {
    assert.match(s.anchor, /prices$/, s.name);
    assert.doesNotMatch(s.anchor, /\b(Australian|Aussie|American|British|Canadian|Australia only|AU only)\b/i, s.name);
  }
});
