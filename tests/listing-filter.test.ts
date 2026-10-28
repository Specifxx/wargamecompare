import { test } from "node:test";
import assert from "node:assert/strict";
import { refuse } from "../src/lib/listing-filter";

const l = (title: string, vendor = "Games Workshop", productType = "", hasCode = true) => ({ title, vendor, productType, tags: [], hasCode });

test("new Games Workshop product passes", () => {
  assert.equal(refuse(l("Space Marines: Outrider Squad")), null);
  assert.equal(refuse(l("CATHAYAN SENTINEL", "GRAND CATHAY", "Warhammer - The Old World")), null);
  assert.equal(refuse(l("Aeldari: Warp Spiders (46-43)", "Warhammer 40K", "Miniature")), null);
});

test("second-hand, damaged and on-sprue listings are refused", () => {
  assert.equal(refuse(l("Space Marines - Terminator Squad (19021-V) - Used", "Used", "Miniatures Used")), "not-new");
  assert.equal(refuse(l("The Lord of the Rings Faramir *missing arm")), "not-new");
  assert.equal(refuse(l("Blades of Khorne Blood Warriors New on Sprue")), "not-new");
  assert.equal(refuse(l("High Elves 5th ed Mage damaged")), "not-new");
});

test("other brands and merchandise are refused", () => {
  assert.equal(refuse(l("Grass Plain: Terrain Marker for Warhammer 40,000 (Kraken Wargames)", "Entoyment Wargaming and Hobby Centre")), "not-gw");
  assert.equal(refuse(l("Warhammer Nurgling Mega Hoodie", "LPG DROPSHIP")), "merch");
  assert.equal(refuse(l("Warhammer 40000: The Horus Heresy Traitor Legion Desk Mat", "Let's Play Games")), "merch");
  assert.equal(refuse(l("Warhammer Collectibles: 1/18 Scale Adeptus Custodes Solar Watch", "Joy Toys")), "merch");
  assert.equal(refuse(l("Donphan [CRI - 045/086]", "ME04: Chaos Rising", "Pokemon Singles", false)), "not-gw");
});

test("a store-made bundle without a product code is refused", () => {
  assert.equal(refuse(l("Tone Pro: Scinari Blue paint bundle", "Games Workshop", "", false)), "store-bundle");
});

test("a code-less title from the store's own GW collection counts as Games Workshop, other brands never", () => {
  const base = { vendor: "Entoyment", productType: "", tags: [], hasCode: false };
  assert.equal(refuse({ ...base, title: "Goliath Gang" }), "not-gw");
  assert.equal(refuse({ ...base, title: "Goliath Gang", gwCollection: true }), null);
  assert.equal(refuse({ ...base, title: "Goliath Gang - painted", gwCollection: true }), "not-new");
});
