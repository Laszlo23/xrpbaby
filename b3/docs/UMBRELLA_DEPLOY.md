# Umbrella site — `home.buildingcultureid.space`

> **Updated:** Home marketing content now lives in the unified TanStack app at [`app/`](../app/) (`/` route). Prefer a **301 redirect** from `home.buildingcultureid.space` → `https://app.buildingcultureid.space/` instead of maintaining a separate static build.

The former `b3/umbrella/` Vite SPA source has been **retired**. Landing sections are in [`app/src/components/landing/`](../app/src/components/landing/).

## Recommended nginx (redirect)

See [`infra/nginx-home-buildingculture.example.conf`](../infra/nginx-home-buildingculture.example.conf) — canonical redirect to the unified app.

## DNS

Keep the **A/AAAA** record for `home` if you want the redirect host, or CNAME to the same VPS as `app.buildingcultureid.space`.

## Deploy script

[`scripts/deploy-home-buildingculture.sh`](../scripts/deploy-home-buildingculture.sh) exits with instructions to use the unified app deploy (`./scripts/deploy-ssh.sh`) and nginx redirect.

## Verify

```bash
curl -sI https://home.buildingcultureid.space | head -n 5
# Expect: 301/302 Location: https://app.buildingcultureid.space/
```

## Related docs

- [DOMAIN_CUTOVER.md](DOMAIN_CUTOVER.md)
- [COMMUNITY_GUIDE_HOSTING.md](COMMUNITY_GUIDE_HOSTING.md) — `/guide` on the unified app
