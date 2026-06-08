#!/bin/sh
set -e
cd /workspace

if [ -f package.json ]; then
  npm install --prefer-offline --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund
  exec npm run dev -- --host 0.0.0.0 --port 5173
fi

echo "Waiting for project files..."
while [ ! -f package.json ]; do sleep 2; done
npm install --no-audit --no-fund
exec npm run dev -- --host 0.0.0.0 --port 5173
