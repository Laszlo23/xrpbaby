#!/usr/bin/env bash
# Fail if staged/index changes contain likely secrets. Run before git push.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail=0

echo "== Security pre-push check =="

# 1) Block any .env files (except .env.example)
while IFS= read -r -d '' f; do
  case "$f" in
    *.env.example|*/.env.example|*/.env.docker.example|*/.env.local.example|*/.env.production.example) continue ;;
    */.env|*/.env.*|*/.env.local|*/.env.production|*/dotenv-for-build) ;;
    *) continue ;;
  esac
  echo "BLOCKED: secret env file staged or tracked: $f"
  fail=1
done < <(git diff --cached --name-only -z 2>/dev/null; git ls-files -z 2>/dev/null)

# 2) Patterns in staged diff only
if git diff --cached --quiet 2>/dev/null; then
  echo "No staged changes (will scan working tree paths on add)."
else
  # Real secrets only — skip docs/scripts placeholders (0x…, ..., YOUR_, change-me)
  if git diff --cached | grep '^\+' | grep -iE '(PRIVATE_KEY|SECRET_KEY|API_KEY)\s*=\s*[^#\s]' \
    | grep -vE '(YOUR_|change-me|example|0xYOUR|0x…|\.\.\.|#\s|MINTER_PRIVATE_KEY=0x[^0-9a-fA-F]|grep |\.match\()'; then
    if git diff --cached | grep '^\+' | grep -iE '(PRIVATE_KEY|SECRET_KEY|API_KEY)\s*=\s*(0x[a-fA-F0-9]{32,}|sk-[a-zA-Z0-9]{20,})'; then
      echo "BLOCKED: possible secret assignment in staged diff"
      fail=1
    fi
  fi
  if git diff --cached | grep -iE 'sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|xox[baprs]-[a-zA-Z0-9-]{10,}|AKIA[A-Z0-9]{16}'; then
    echo "BLOCKED: API token pattern in staged diff"
    fail=1
  fi
fi

# 3) Confirm known secret paths are ignored
for p in \
  b3/app/.env \
  b3/deploy/.env \
  b3/contracts/.env \
  b3/apps/identity/.env \
  b3/apps/places/web/.env.local \
  b3/cms/.env; do
  if [ -f "$p" ]; then
    if git check-ignore -q "$p" 2>/dev/null; then
      echo "OK ignored: $p"
    else
      echo "BLOCKED: $p exists but is NOT gitignored"
      fail=1
    fi
  fi
done

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "Security check FAILED. Fix issues before push."
  exit 1
fi

echo "Security check passed."
exit 0
