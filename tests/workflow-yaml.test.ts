// Every workflow must parse. A plain YAML value that holds ": " is a syntax error, and GitHub then refuses the
// whole file without a word: refresh-prices.yml's step "Commit the data (no release: idle since …)" (#156) left
// the weekly import unable to run at all until it was quoted (2026-11-21). This catches that one mistake without a
// YAML dependency: an unquoted `name:` or `description:` value may not contain ": " or end in ":".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), ".github", "workflows");

test("no workflow has an unquoted name or description holding a colon", () => {
  const bad: string[] = [];
  for (const file of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
    readFileSync(join(dir, file), "utf8").split("\n").forEach((line, i) => {
      const m = /^\s*(?:-\s+)?(name|description):\s+(.+?)\s*$/.exec(line);
      if (!m) return;
      const value = m[2].replace(/\s+#.*$/, "");
      if (/^["'|>]/.test(value)) return;
      if (/: /.test(value) || /:$/.test(value)) bad.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  assert.deepEqual(bad, []);
});
