import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INDEXNOW_KEY, INDEXNOW_MAX_URLS, indexNowBodies } from "../src/lib/indexnow";

test("the key file is served from public/ and holds exactly the key", () => {
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
  assert.equal(readFileSync(`public/${INDEXNOW_KEY}.txt`, "utf8"), INDEXNOW_KEY);
});

test("each body names the host and key location, keeps only own URLs, dedupes, and splits at the cap", () => {
  const [b, ...rest] = indexNowBodies("https://wargamecompare.com", [
    "https://wargamecompare.com/uk",
    "https://wargamecompare.com/uk",
    "https://example.com/x",
    "not a url",
  ]);
  assert.equal(b.host, "wargamecompare.com");
  assert.equal(b.keyLocation, `https://wargamecompare.com/${INDEXNOW_KEY}.txt`);
  assert.deepEqual(b.urlList, ["https://wargamecompare.com/uk"]);
  assert.equal(rest.length, 0);
  const many = Array.from({ length: INDEXNOW_MAX_URLS + 5 }, (_, i) => `https://wargamecompare.com/p/${i}`);
  const parts = indexNowBodies("https://wargamecompare.com", many);
  assert.deepEqual(parts.map((p) => p.urlList.length), [INDEXNOW_MAX_URLS, 5]);
});
