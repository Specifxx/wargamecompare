#!/usr/bin/env bash
# Vercel "Ignored Build Step" for WargameCompare, wired from vercel.json's `ignoreCommand`. Vercel runs it in the
# repository root before each deployment: exit 0 skips the build, exit 1 builds.
#
# PRODUCTION BUILDS ONLY A RELEASE: a commit whose SUBJECT carries the literal marker [deploy] (any case). The daily
# price import's data commit (refresh-prices.yml) carries it, so there is one build a day; code commits ride it. A
# release out of turn: run "Release now" (release.yml), which lands an empty [deploy] commit. Each build empties the CDN
# cache, and on the sister sites a build per push was what ran up the bills (Rift Compare's DECISIONS.md, 2026-09-11).
# The SUBJECT only: a body that mentions the marker in prose does not deploy.
#
# PREVIEW AND DEVELOPMENT BUILDS ARE OFF: a preview builds only when the SUBJECT carries [preview], added only when the
# owner asks for one. claude/* and ccr-* branches never deploy at all (vercel.json).
#
# Fail open on production: an unreadable subject, or git unable to compare HEAD^ with HEAD on a [deploy] commit,
# builds. VERCEL_ENV unset is treated as production. Pinned by tests/vercel-ignore-build.test.ts.
set -u

PREVIEW_MARKER='[preview]'
DEPLOY_MARKER='[deploy]'

git diff --quiet HEAD^ HEAD -- . 2>/dev/null
diff=$? # 0: nothing under this app changed; 1: it changed; anything else: git could not tell

env="${VERCEL_ENV:-}"
if [ "$env" = "preview" ] || [ "$env" = "development" ]; then
  msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
  if [ -z "$msg" ]; then
    msg="$(git log -1 --format=%B 2>/dev/null || true)"
  fi
  subject="$(printf '%s\n' "$msg" | head -n 1)"
  if [ -z "$subject" ] || ! printf '%s' "$subject" | grep -qiF -- "$PREVIEW_MARKER"; then
    echo "[vercel-ignore-build] VERCEL_ENV=$env: previews are off (owner, 2026-10-14) — skipping. Put '$PREVIEW_MARKER' in the commit SUBJECT only when the owner asks for a preview."
    exit 0
  fi
  if [ "$diff" -eq 0 ]; then
    echo "[vercel-ignore-build] VERCEL_ENV=$env: '$PREVIEW_MARKER' in the subject, but nothing changed — skipping."
    exit 0
  fi
  echo "[vercel-ignore-build] VERCEL_ENV=$env: '$PREVIEW_MARKER' in the commit subject — building the preview that was asked for."
  exit 1
fi

msg="${VERCEL_GIT_COMMIT_MESSAGE:-}"
if [ -z "$msg" ]; then
  msg="$(git log -1 --format=%B 2>/dev/null || true)"
fi
subject="$(printf '%s\n' "$msg" | head -n 1)"
label="VERCEL_ENV=${env:-unset (treated as production)}"
if [ -z "$subject" ]; then
  echo "[vercel-ignore-build] $label: the commit subject could not be read — building, to fail open."
  exit 1
fi
if ! printf '%s' "$subject" | grep -qiF -- "$DEPLOY_MARKER"; then
  echo "[vercel-ignore-build] $label: no '$DEPLOY_MARKER' in the commit subject — skipping; this commit rides the next release (the daily price import's data commit)."
  exit 0
fi

case "$diff" in
  0)
    # An EMPTY [deploy] commit is a release on purpose (release.yml lands one); a [deploy] commit that changed only
    # another app of another project is not this app's.
    if git diff --quiet HEAD^ HEAD 2>/dev/null; then
      echo "[vercel-ignore-build] $label: an empty '$DEPLOY_MARKER' commit — building the release."
      exit 1
    fi
    echo "[vercel-ignore-build] $label: '$DEPLOY_MARKER', but nothing changed — skipping."
    exit 0
    ;;
  1)
    echo "[vercel-ignore-build] $label: '$DEPLOY_MARKER' and the commit changed files — building."
    exit 1
    ;;
  *)
    echo "[vercel-ignore-build] $label: '$DEPLOY_MARKER', and git could not compare HEAD^ with HEAD (status $diff) — building, to fail open."
    exit 1
    ;;
esac
