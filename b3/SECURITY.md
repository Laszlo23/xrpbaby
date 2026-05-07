# Security — secrets and incident response

## Never commit secrets

- Do **not** commit `frontend/.env`, `contracts/.env`, `strapiapp/.env`, or any file containing private keys, JWT secrets, or API keys.
- Use the `*.env.example` files in each package as templates; copy to `.env` locally only.

## If secrets were ever committed to git

1. **Rotate immediately** (old values are compromised):
   - EVM deployer / operator private keys → fund a new wallet, abandon the old one on-chain where possible.
   - Thirdweb / RPC / storage API keys → revoke in vendor console, issue new keys.
   - Strapi `APP_KEYS`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, API tokens → regenerate; invalidate old sessions.
2. **Scrub history** (org-wide; requires admin):
   - Use [`git filter-repo`](https://github.com/newren/git-filter-repo) or BFG to remove `.env` blobs from all branches, then force-push protected branches after team coordination.
3. **Audit access** — check GitHub secret scanning, CI logs, and fork mirrors.

## Reporting

- Report suspected leaks or vulnerabilities to the project owners through a private channel (not a public issue) until triaged.

## Deploy hosts

- Production env vars live only on the server or in a secrets manager (1Password, Doppler, etc.), never in the repo.
