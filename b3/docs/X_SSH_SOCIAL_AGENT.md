# X / social posting from the SSH host (automation-ready)

The app posts to X through **`POST /api/marketing/x-post`** (see [`b3/frontend/src/routes/api/marketing/x-post.tsx`](../frontend/src/routes/api/marketing/x-post.tsx)). The Docker `web` service loads the same variables from **`frontend/.env`** on the server.

## 1. One-time: set variables on the server

Edit **`/opt/buildingculture-frontend/frontend/.env`** (or your `DEPLOY_PATH/frontend/.env`). Do **not** commit real values; `deploy-ssh.sh` does not rsync local `.env` to the server.

| Variable | Purpose |
|----------|---------|
| `X_CONSUMER_KEY`, `X_CONSUMER_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | OAuth 1.0a user context — required for posting and for quest verification when enabled |
| `X_MARKETING_ADMIN_SECRET` | Shared secret; must match header on each post request |
| `PUBLIC_APP_ORIGIN` or `VITE_APP_ORIGIN` | Canonical `https://…` origin the script uses to call the API (or set `X_MARKETING_PUBLIC_ORIGIN` as an override) |
| `VITE_X_TARGET_POST_URL` / `X_OFFICIAL_QUEST_TARGET_TWEET_ID` | Align points-ledger X quests with the same official tweet when using API verification |

After changing `.env`:

```bash
cd /opt/buildingculture-frontend/frontend
docker compose -f docker-compose.stack.yml --env-file .env up -d
```

(or your usual redeploy).

## 2. Post from the server (recommended for agents)

From the synced repo on the VPS:

```bash
cd /opt/buildingculture-frontend/frontend
node scripts/x-marketing-post.mjs "Your post text"
```

Reply to a tweet:

```bash
node scripts/x-marketing-post.mjs --reply-to 1234567890123456789 "Short reply"
```

Pipe body (use `-` so the script reads stdin and does not hang when no TTY):

```bash
echo "Multi-line or long text" | node scripts/x-marketing-post.mjs -
```

Custom env file path:

```bash
ENV_FILE=/secure/path/prod.env node scripts/x-marketing-post.mjs "…"
```

Success prints JSON with `tweetId` and `url`. Failures print HTTP status and body.

## 3. Optional: cron or systemd timer

Point a timer at the same `node scripts/x-marketing-post.mjs "…"` command. Stay within **X API rate limits** for your product tier; avoid spam / unsolicited @ outreach (policy and account risk).

## 4. Security

- `chmod 600 frontend/.env` on the server.
- Rotate `X_MARKETING_ADMIN_SECRET` if it leaks; header name is `x-x-marketing-admin-secret`.
- This flow does **not** prove a wallet owns an X account; it only automates the official account.

## 5. npm shortcut (local or on host)

From `b3/frontend`:

```bash
npm run x:post -- "Your text"
```

Additional args after `--` are passed to the script (e.g. `npm run x:post -- --reply-to ID "text"`).
