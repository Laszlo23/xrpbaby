# Culture Pulse — cron jobs

## Ingest social streams (every 15 minutes)

```bash
cd /path/to/b3
npm run pulse:ingest
```

Requires `DATABASE_URL` and enabled stream credentials in `app/.env`.

### systemd timer example

`/etc/systemd/system/bc-pulse-ingest.service`:

```ini
[Unit]
Description=Building Culture pulse ingest

[Service]
Type=oneshot
WorkingDirectory=/opt/buildingculture
EnvironmentFile=/opt/buildingculture/deploy/.env
ExecStart=/usr/bin/npm run pulse:ingest
```

`/etc/systemd/system/bc-pulse-ingest.timer`:

```ini
[Unit]
Description=Run pulse ingest every 15 minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
```

## Daily on-chain attestation (UTC)

After deploying `CulturePulseAnchor` and setting `PULSE_ANCHOR_ADDRESS`:

```bash
npm run pulse:attest
```

Recommended: `5 0 * * *` (00:05 UTC daily).

### Production (Base mainnet 8453)

On the VPS, from repo root `b3/` with `deploy/.env` synced to `app/.env` for builds:

```bash
# deploy/.env must include:
# PULSE_ANCHOR_ADDRESS=0x...   (from contracts/deployments/8453.json)
# PULSE_ATTEST_CHAIN_ID=8453
# BASE_MAINNET_RPC_URL=https://mainnet.base.org
# PRIVATE_KEY or PULSE_ATTEST_PRIVATE_KEY (attest wallet)
# DATABASE_URL via docker compose postgres service

5 0 * * * cd /opt/buildingculture && /usr/bin/npm run pulse:attest >> /var/log/bc-pulse-attest.log 2>&1
```

Deploy anchor (mainnet):

```bash
set -a && source contracts/.env && set +a
export PULSE_ATTEST_CHAIN_ID=8453 BASE_MAINNET_RPC_URL="${RPC_URL:-https://mainnet.base.org}"
npm run deploy:pulse-mainnet
```

Sepolia staging:

```bash
export PRIVATE_KEY=0x...
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export PULSE_ATTEST_CHAIN_ID=84532
chmod +x scripts/deploy-pulse-anchor.sh
./scripts/deploy-pulse-anchor.sh
```

Public digest URL: `{PUBLIC_APP_ORIGIN}/api/pulse/digest/YYYY-MM-DD`
