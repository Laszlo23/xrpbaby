# The Founding Builders — local development

Gamified pre-launch app for Building Culture Dollar ($BCD). Stack: **FastAPI + MongoDB** backend, **Expo 54** frontend.

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+ (3.14 works with the included venv)
- Docker (for MongoDB)

## Quick start

### 1. MongoDB

```bash
docker compose up -d mongo
```

Mongo runs on **localhost:27018** (avoids conflicts with an existing Mongo on 27017).

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000/api  
Docs: http://localhost:8000/docs

Copy `backend/.env` if missing (see variables below).

### 3. Frontend

```bash
cd frontend
npm install
npx expo start --web
```

Open http://localhost:8081 in the browser (or press `w` in the Expo terminal).

Set `EXPO_PUBLIC_BACKEND_URL=http://localhost:8000` in `frontend/.env`.

## Environment variables

**backend/.env**

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | e.g. `mongodb://localhost:27018` |
| `DB_NAME` | Database name (`founding_builders`) |
| `JWT_SECRET_KEY` | Secret for JWT signing |
| `EMERGENT_LLM_KEY` | Emergent API key for AI Mayor (optional locally; stub replies without it) |
| `LAUNCH_DATE_UTC` | Countdown target (default `2026-05-30T12:00:00Z`) |
| `NEYNAR_API_KEY` | Neynar API key for Farcaster sign-in / FID linking |
| `NEYNAR_CLIENT_ID` | Neynar app client ID (UUID from developer portal) |

**frontend/.env**

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_BACKEND_URL` | Backend base URL, e.g. `http://localhost:8000` |

## Farcaster Mini App (production)

Production URL: **https://miniapp.buildingcultureid.space**

1. Deploy the Expo web build so static files are served from that domain (including `public/.well-known/farcaster.json`).
2. In Warpcast → **Settings → Developer → Domains**, add `miniapp.buildingcultureid.space` and generate **accountAssociation**.
3. Paste the signed `header`, `payload`, and `signature` into [`frontend/public/.well-known/farcaster.json`](frontend/public/.well-known/farcaster.json) (replace the `REPLACE_VIA_WARPCAST` placeholders).
4. Set `NEYNAR_API_KEY` and `NEYNAR_CLIENT_ID` in `backend/.env`. Add `https://miniapp.buildingcultureid.space` as an authorized origin in the Neynar developer portal.
5. Verify: `curl https://miniapp.buildingcultureid.space/.well-known/farcaster.json`

Builders link Farcaster from **Profile → Connect Farcaster** (email/password auth stays; FID is stored on the account).

## Notes

- `emergentintegrations` is not on public PyPI; a **local stub** under `backend/emergentintegrations/` powers Mayor chat in dev. Set a real `EMERGENT_LLM_KEY` when you have one.
- Mobile: `npx expo start` then scan the QR code with Expo Go (iOS/Android).
