import { test } from "node:test";
import assert from "node:assert/strict";
import { codesOf, groupListings, titleKey } from "../src/lib/identify";

// Real store titles and SKUs from the 2026-10-28 probe.
test("box codes from SKUs and titles, compared as numbers", () => {
  assert.deepEqual(codesOf("Space Marines: Outrider Squad", ["48-112"]), [{ kind: "short", value: "48-112" }]);
  assert.deepEqual(codesOf("Necrolith Bone 2: Warhammer Tone 18ml", ["20-052"]), [{ kind: "short", value: "20-52" }]);
  assert.deepEqual(codesOf("Aeldari: Warp Spiders (46-43)", ["5011921225620"]), [
    { kind: "ean", value: "5011921225620" },
    { kind: "short", value: "46-43" },
  ]);
  assert.deepEqual(codesOf("Necromunda Halls Of The Ancients Dice", ["5011921234080 (301-40)"]), [
    { kind: "ean", value: "5011921234080" },
    { kind: "short", value: "301-40" },
  ]);
  assert.deepEqual(codesOf("Tone Pro: Khemri Sands 1 12ml.", ["9918996122106"]), [{ kind: "item", value: "99189961221" }]);
  assert.deepEqual(
    codesOf("Warhammer: Age of Sigmar - Khazalite Holds - Army Set [60010205001] (P", ["84-05"]),
    [{ kind: "short", value: "84-5" }, { kind: "item", value: "60010205001" }],
  );
  // A store-made bundle's suffixed SKU, and other brands' SKUs, are no code.
  assert.deepEqual(codesOf("Warhammer Tone Pro Paint | Lustria Green 1 - 5 Bundle", ["9918996133106-b"]), []);
  assert.deepEqual(codesOf("Grass Plain: Terrain Marker (Kraken Wargames)", ["KWG-TM2-001"]), []);
  assert.deepEqual(codesOf("Warhammer 40k - Space Marines - Intercessor Squad", ["GAW48115"]), []);
});

test("listings sharing a code are one product; a code bridged to another product's code is refused", () => {
  const g = groupListings([
    { store: "a", title: "Space Marines: Outrider Squad", codes: codesOf("", ["48-112"]) },
    { store: "b", title: "Outrider Squad", codes: codesOf("", ["48-112"]) },
    { store: "c", title: "Space Marines: Outrider Squad", codes: codesOf("", ["99120101498"]) },
    { store: "d", title: "Warhammer 40,000 Space Marines Outrider Squad (48-112)", codes: codesOf("Warhammer 40,000 Space Marines Outrider Squad (48-112)", ["99120101498"]) },
    { store: "e", title: "Space Marines: Captain on Bike", codes: codesOf("", ["99120101499"]) },
  ]);
  assert.equal(g[0], g[1]);
  assert.equal(g[0], g[2]); // bridged by store d's title code
  assert.equal(g[0], g[3]);
  assert.notEqual(g[0], g[4]);
});

test("a store that uses one code for two different kits loses that code", () => {
  const g = groupListings([
    { store: "westcoast", title: "Kingdom of Bretonnia 36x Men-at-Arms New on Sprue", codes: codesOf("", ["06-09"]) },
    { store: "westcoast", title: "Kingdom of Bretonnia Lord on Royal Pegasus New on Sprue", codes: codesOf("", ["06-09"]) },
    { store: "incom", title: "PEGASUS KNIGHTS", codes: codesOf("", ["06-09"]) },
  ]);
  assert.equal(g[0], -1);
  assert.equal(g[1], -1);
  assert.notEqual(g[2], -1);
});

test("a typo'd code whose title shares nothing with the product is dropped", () => {
  const g = groupListings([
    { store: "a", title: "Orks: Wartrakk", codes: codesOf("", ["50-74"]) },
    { store: "b", title: "Wartrakk", codes: codesOf("", ["50-74"]) },
    { store: "c", title: "Tyranids: Haruspex", codes: codesOf("", ["50-74"]) },
  ]);
  assert.equal(g[0], g[1]);
  assert.equal(g[2], -1);
});

test("a code-less listing joins only by an exact cleaned title held by one product", () => {
  assert.equal(titleKey("Warhammer Tone Pro Paint - Ta'Unar Ochre 2"), titleKey("Tone Pro: Ta'Unar Ochre 2 12ml."));
  const g = groupListings([
    { store: "grimdice", title: "Tone Pro: Ta'Unar Ochre 2 12ml.", codes: codesOf("", ["9918996129706"]) },
    { store: "thewarp", title: "Warhammer Tone Pro Paint - Ta'Unar Ochre 2", codes: [] },
    { store: "thewarp", title: "Warhammer Tone Pro Paint - Ta'Unar Ochre 3", codes: [] },
  ]);
  assert.equal(g[1], g[0]);
  assert.equal(g[2], -1);
});

test("bare box codes at a title's start or end, or after #, never in the middle", () => {
  const short = (t: string) => codesOf(t, []).find((c) => c.kind === "short")?.value ?? null;
  assert.equal(short("21-04 Warhammer Colour Base: Khorne Red"), "21-4");
  assert.equal(short("Citadel Base: Khorne Red 21-04"), "21-4");
  assert.equal(short("Citadel Base #21-53 Wraithbone"), "21-53");
  assert.equal(short("Round Bases 25-32 mm adapters"), null);
  assert.equal(short("Kill Team 2024-25 season"), null);
});

test("a listing filed under another kit's code is dropped when it lacks the kit's own words", () => {
  const L = (store: string, title: string) => ({ store, title, codes: codesOf(title, ["47-14"]) });
  const g = groupListings([
    L("a", "Astra Militarum: Bullgryns"),
    L("b", "Warhammer 40k Astra Militarum Bullgryns / Ogryns"),
    L("c", "Militarum Auxilla Bullgryns"),
    L("d", "Bullgryns"),
    L("e", "47-14 Warhammer 40K - Astra Militarum: Kasrkin"),
  ]);
  assert.equal(new Set(g.slice(0, 4)).size, 1);
  assert.ok(g[0] >= 0);
  assert.equal(g[4], -1);
});
