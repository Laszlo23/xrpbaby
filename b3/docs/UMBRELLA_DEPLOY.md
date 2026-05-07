# Umbrella site — `home.buildingculture.capital`

The marketing umbrella (links hub) lives in [`b3/umbrella`](../umbrella/). It is a **static Vite SPA** — deploy the `dist/` folder behind nginx with `try_files` (same pattern as `eco.buildingculture.capital`).

## DNS

Add an **A** (and **AAAA** if you use IPv6) record:

- **Name:** `home`
- **Target:** your VPS IP (same host as `0x` / `eco` if you co-locate)

## One-command deploy

From the repo root (`b3/`):

```bash
export DEPLOY_HOST=root@YOUR_VPS_IP
export CERTBOT_EMAIL=ops@yourdomain.com   # required the first time for Let's Encrypt
./scripts/deploy-home-buildingculture.sh
```

Optional overrides:

- `PUBLIC_DOMAIN` — default `home.buildingculture.capital`
- `REMOTE_ROOT` — default `/var/www/home-buildingculture`

## What the script does

1. `npm install` at workspace root, then `npm --prefix umbrella run build`
2. `rsync` `umbrella/dist/` → `${REMOTE_ROOT}/` on the server
3. Installs or patches nginx: [`scripts/install-nginx-home-on-server.sh`](../scripts/install-nginx-home-on-server.sh) → `sites-available/buildingculture-home.conf`
4. Runs `certbot --nginx -d home.buildingculture.capital` if no certificate exists yet

## Reference nginx

See [`infra/nginx-home-buildingculture.example.conf`](../infra/nginx-home-buildingculture.example.conf).

## Verify

```bash
curl -sI https://home.buildingculture.capital | head -n 5
```

Expect **200** on `/` and `Cache-Control: no-cache` on `/index.html`.

## Apex domain

**`buildingculture.capital` (apex)** is intentionally separate: use it for a marketing splash or redirect as you prefer. The umbrella “hub” product surface described on the site is served from **`home.buildingculture.capital`**.

## Related surfaces

| Subdomain | Role |
|-----------|------|
| `home.buildingculture.capital` | Umbrella links / narrative (this deploy) |
| `0x.buildingculture.capital` | Market (TanStack app, proxied port — see `install-nginx-0x-on-server.sh`) |
| `app.buildingculture.capital` | Live dApp |
| `eco.buildingculture.capital` | Eco static hub (`deploy-eco-buildingculture.sh`) |
