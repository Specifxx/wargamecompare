// The deploy gate (scripts/vercel-ignore-build.sh): production builds only a [deploy] SUBJECT, previews only a
// [preview] SUBJECT, and claude/* branches never deploy. A build per push is what ran up the sister sites' bills.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCRIPT = join(ROOT, "scripts/vercel-ignore-build.sh");
const TMP = mkdtempSync(join(tmpdir(), "wgc-ignore-"));
after(() => rmSync(TMP, { recursive: true, force: true }));
const ENV = { PATH: process.env.PATH ?? "", HOME: TMP, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "/dev/null", GIT_CEILING_DIRECTORIES: TMP, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@e", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@e" };
const git = (cwd: string, ...a: string[]) => assert.equal(spawnSync("git", a, { cwd, env: ENV as never }).status, 0, a.join(" "));

let n = 0;
function repo(message: string, empty = false): string {
  const dir = join(TMP, `r${n++}`);
  spawnSync("mkdir", ["-p", dir]);
  writeFileSync(join(dir, "a.txt"), "1");
  git(dir, "init", "-q", "-b", "main");
  git(dir, "add", ".");
  git(dir, "commit", "-q", "-m", "base");
  if (empty) git(dir, "commit", "-q", "--allow-empty", "-m", message);
  else {
    writeFileSync(join(dir, "a.txt"), "2");
    git(dir, "commit", "-q", "-am", message);
  }
  return dir;
}
const gate = (cwd: string, env: string | null, msg: string | null) => {
  const e: Record<string, string> = { ...ENV };
  if (env) e.VERCEL_ENV = env;
  if (msg != null) e.VERCEL_GIT_COMMIT_MESSAGE = msg;
  return spawnSync("bash", [SCRIPT], { cwd, env: e as never }).status;
};
const BUILD = 1;
const SKIP = 0;

test("vercel.json runs the gate and never deploys claude/* branches", () => {
  const v = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  assert.equal(v.ignoreCommand, "bash scripts/vercel-ignore-build.sh");
  assert.equal(v.git.deploymentEnabled["claude/*"], false);
});

test("production: [deploy] in the subject only", () => {
  for (const env of ["production", null]) {
    assert.equal(gate(repo("Fix the product page"), env, "Fix the product page"), SKIP);
    assert.equal(gate(repo("x"), env, "Fix it\n\nThe daily [deploy] commit releases this."), SKIP, "body only");
    assert.equal(gate(repo("data: daily prices [deploy]"), env, "data: daily prices 2026-10-28 [deploy]"), BUILD);
    assert.equal(gate(repo("Release [DEPLOY]", true), env, "Release [DEPLOY]"), BUILD, "empty release commit");
  }
  assert.equal(gate(repo("data [deploy]"), "production", null), BUILD, "reads git log when the variable is unset");
});

test("previews only with [preview] in the subject", () => {
  assert.equal(gate(repo("Fix"), "preview", "Fix"), SKIP);
  assert.equal(gate(repo("Fix [deploy]"), "preview", "Fix [deploy]"), SKIP);
  assert.equal(gate(repo("Fix [Preview]"), "preview", "Fix [Preview]"), BUILD);
  assert.equal(gate(repo("Fix"), "development", ""), SKIP);
});

test("the daily data commit carries the marker and code commits never do", () => {
  const wf = readFileSync(join(ROOT, ".github/workflows/refresh-prices.yml"), "utf8");
  assert.match(wf, /git commit[^\n]*\[deploy\]/);
});
