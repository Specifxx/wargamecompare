import { test } from "node:test";
import assert from "node:assert/strict";
import { FACTION_BY_SLUG, FACTIONS, SYSTEMS, TYPES, factionOf, systemOf, typeOf } from "../src/lib/catalog";

const sys = (t: string) => systemOf(t)?.slug ?? null;

test("game systems from real store titles", () => {
  assert.equal(sys("Kill Team: Death Korps (2024)"), "kill-team");
  assert.equal(sys("Warhammer 40,000: Combat Patrol: Space Marines"), "warhammer-40k");
  assert.equal(sys("Stormcast Eternals: Vindictors"), "age-of-sigmar");
  assert.equal(sys("Citadel Contrast: Black Templar (18ml)"), "citadel");
  assert.equal(sys("Horus Heresy: Legiones Astartes MKVI Tactical Squad"), "horus-heresy");
  assert.equal(sys("Necromunda: House of Iron Box Set"), "necromunda");
  assert.equal(sys("Blood Bowl: Gnome Team"), "blood-bowl");
});

test("factions are never guessed for paints or novels", () => {
  assert.equal(factionOf("Citadel Base: Kasrkin Fur", "citadel"), null);
  assert.equal(factionOf("Dark Imperium (Paperback)", "black-library"), null);
  assert.equal(factionOf("Combat Patrol: Space Marines", "warhammer-40k")?.slug, "space-marines");
  // Chaos Space Marines titles also say "Space Marines" (2026-10-30: the UK hub had 1 product).
  assert.equal(factionOf("Chaos Space Marines: Legionaries", "warhammer-40k")?.slug, "chaos-space-marines");
  assert.equal(factionOf("Combat Patrol: Chaos Space Marines", "warhammer-40k")?.slug, "chaos-space-marines");
});

test("product types", () => {
  assert.equal(typeOf("Combat Patrol: Necrons", "warhammer-40k").slug, "combat-patrols");
  assert.equal(typeOf("Codex: Orks", "warhammer-40k").slug, "books");
  assert.equal(typeOf("Citadel Shade: Nuln Oil", "citadel").slug, "paints");
  assert.equal(typeOf("Dark Imperium", "black-library").slug, "books");
  assert.equal(typeOf("Intercessors", "warhammer-40k").slug, "miniatures");
});

test("slugs are unique, URL-safe and every faction's system exists", () => {
  for (const list of [SYSTEMS, FACTIONS, TYPES] as { slug: string }[][]) {
    assert.equal(new Set(list.map((x) => x.slug)).size, list.length);
    for (const x of list) assert.match(x.slug, /^[a-z0-9-]+$/);
  }
  const systems = new Set(SYSTEMS.map((s) => s.slug));
  for (const f of FACTION_BY_SLUG.values()) assert.ok(systems.has(f.system), `${f.slug}: ${f.system}`);
});
