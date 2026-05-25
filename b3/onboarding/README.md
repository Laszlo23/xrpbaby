# Building Culture — Landing Page

Story-driven marketing site with a React frontend and FastAPI + MongoDB backend.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- [Python](https://www.python.org/) 3.10+
- [Docker](https://www.docker.com/) (for local MongoDB)

## Quick start

### 1. MongoDB

```bash
docker compose up -d
```

If port `27017` is already in use, you already have MongoDB running locally — skip Docker and keep `MONGO_URL=mongodb://localhost:27017` in `backend/.env`.

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # skip if .env already exists
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000/api/

### 3. Frontend (new terminal)

```bash
cd frontend
cp .env.example .env        # skip if .env already exists
npm install
npm start
```

`frontend/.npmrc` enables `legacy-peer-deps` for `react-day-picker` vs `date-fns` compatibility.

Site: http://localhost:3000

## Environment

| Variable | Location | Default |
|----------|----------|---------|
| `MONGO_URL` | `backend/.env` | `mongodb://localhost:27017` |
| `DB_NAME` | `backend/.env` | `buildingculture` |
| `CORS_ORIGINS` | `backend/.env` | `http://localhost:3000` |
| `REACT_APP_BACKEND_URL` | `frontend/.env` | `http://localhost:8000` |

## Verify

```bash
curl http://localhost:8000/api/
curl http://localhost:8000/api/ecosystem
```

Backend tests (with API running):

```bash
cd backend && REACT_APP_BACKEND_URL=http://localhost:8000 pytest tests/ -v
```

## Production (app.buildingcultureid.space)

Live stack on Hostinger VPS (`187.124.18.204`):

- **Site:** https://app.buildingcultureid.space (nginx static + SPA)
- **API:** https://app.buildingcultureid.space/api/ (uvicorn on `127.0.0.1:8020`)
- **MongoDB:** Docker (`buildingculture-landing-mongo`)
- **SSL:** Let's Encrypt (auto-renew via certbot)

Redeploy after changes:

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

First-time server setup (already done on production):

```bash
./deploy/deploy.sh   # uploads build + backend
ssh root@SERVER 'bash /opt/buildingculture-landing/remote-install.sh'
```
