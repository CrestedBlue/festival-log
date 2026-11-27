#!/usr/bin/env bash
# Checks that the live site serves this checkout (the user, 2026-11-27: check every deploy went out).
# Builds the app as the deploy workflow does (BASE_PATH=/festival-log/) into a temp folder and waits until the live
# index.html names the same hashed JS files. Vite names each file by its content, so the same names = the same build.
# No GitHub API: unauthenticated calls hit the rate limit.
# Run after `git push`: bash scripts/check-deploy.sh   (waits up to ~6 minutes)
set -euo pipefail

SITE='https://crestedblue.github.io/festival-log/'
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

BASE_PATH=/festival-log/ npx vite build --outDir "$OUT" --emptyOutDir --logLevel error
want="$(grep -o 'assets/[^"]*\.js' "$OUT/index.html" | sort)"

for attempt in $(seq 1 24); do
  live="$(curl -fsS -H 'Cache-Control: no-cache' "$SITE?check=$(date +%s)" | grep -o 'assets/[^"]*\.js' | sort || true)"
  if [ "$live" = "$want" ]; then
    echo "deployed: the live site serves $(git rev-parse --short HEAD)"
    exit 0
  fi
  echo "not yet ($attempt/24), waiting 15s"
  sleep 15
done
echo "NOT deployed: the live site still serves another build (check GitHub Actions)" >&2
exit 1
