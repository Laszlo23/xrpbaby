# PRD — The Founding Builders ($BCD pre-launch)

## Vision
A viral, gamified pre-launch experience for **Building Culture Dollar ($BCD)**. Not a token page — a community game where every action helps "bring places back to life". Mobile-first, dark mode, premium feel (Duolingo × Clash of Clans × Pokemon GO × Farcaster).

## Stack
- Backend: FastAPI + MongoDB (motor), JWT auth (bcrypt + PyJWT), Claude Sonnet 4.6 AI Mayor via emergentintegrations
- Frontend: Expo 54 / Expo Router (mobile + web), react-native-reanimated, expo-blur, expo-linear-gradient, expo-image, expo-clipboard

## Countdown target
**May 30, 2026 12:00 UTC** (configured in `backend/.env` as `LAUNCH_DATE_UTC`)

## Levels & XP
- L1 Explorer (0) · L2 Builder (500) · L3 Creator (1500) · L4 Architect (3000) · L5 Visionary (5000) · L6 Founder (10000)
- XP rewards: daily_login 25, visit_ecosystem 50–200, daily_quest 200, weekly_mission 1000, share 150, invite 500, friend_registers 1000, complete_profile 100, …

## Backend endpoints (all under `/api`)
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- Public: `GET /countdown`, `GET /stats`, `GET /feed`, `GET /leaderboard?category=xp|referrers|founders`
- Profile: `PATCH /profile`, `POST /profile/daily-login`
- Ecosystem: `GET /ecosystem`, `POST /ecosystem/visit`
- Quests: `GET /quests/daily`, `POST /quests/complete`, `GET /quests/community`
- Vault: `POST /mystery-box/open`, `GET /spin/status`, `POST /spin`
- Social actions: `POST /share/x`, `POST /share/farcaster`, `POST /share/telegram`
- Mayor: `POST /mayor/chat`, `GET /mayor/history`

## Frontend routes
- `/` — splash hero with countdown, CTAs Start Building / View Leaderboard / Sign in
- `/(auth)/register`, `/(auth)/login` — JWT auth
- `/leaderboard-public` — public leaderboard
- `/(tabs)` — Home Village / Quests / Inventory (Vault) / Leaderboard / Profile
- `/mayor` — AI Mayor chat (Claude Sonnet 4.6)
- `/feed` — live community feed

## Game mechanics (MVP scope shipped)
- Player profile (avatar letter, username, XP, level, founding score, referral code & count, badges, keys, mystery boxes)
- Daily quests (3 random per day with deterministic per-user seed)
- Ecosystem explorer quests (7 real BC apps, +XP on first visit)
- Community missions with global progress bars (5 missions)
- Key Hunt (Builder/Culture/Vision/Founder rarities, weighted drops)
- Mystery Box opening (XP / key / boost)
- Spin the Wheel (24h cooldown, 8 segments)
- Referral engine (codes + bonus XP)
- Multi-tab leaderboard (XP / Referrers / Founders)
- Founding badges grid (6 badges, level-locked)
- Live community feed
- AI Mayor "Mayor Culture" – Claude Sonnet 4.6 persona + per-user context

## Farcaster (partial)
- Mini App manifest at `/.well-known/farcaster.json` for `miniapp.buildingcultureid.space`
- Link Farcaster (FID) to existing JWT account via Neynar SIWN; displayed on profile + leaderboard
- Full wallet-primary auth remains future work

## Out of scope / future
- Wallet-primary auth (replace email login)
- Push notifications
- Weekly missions detail UI
- Token claim portal (launch day event)
