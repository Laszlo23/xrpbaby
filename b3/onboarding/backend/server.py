from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Building Culture API")
api_router = APIRouter(prefix="/api")


# ----------------- Helpers -----------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ----------------- Models -----------------
class WaitlistCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = None  # community | builder | investor | other
    source: Optional[str] = None


class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: Optional[str] = None
    role: Optional[str] = None
    source: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class EcosystemApp(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    url: Optional[str] = None
    description: str
    tag: str
    status: str = "beta"  # beta | live | coming-soon
    layer: str  # vision | core | living | identity | art | ai | engagement | growth


class AnalyticsEvent(BaseModel):
    event: str
    section: Optional[str] = None
    meta: Optional[dict] = None


# ----------------- Static Ecosystem Data -----------------
ECOSYSTEM: List[dict] = [
    {
        "id": "bc-capital",
        "name": "Building Culture Capital",
        "url": "https://buildingculture.capital",
        "description": "The home of the movement. Learn about the vision, community, properties and future of Building Culture.",
        "tag": "Vision Platform",
        "status": "beta",
        "layer": "vision",
    },
    {
        "id": "bc-app",
        "name": "Building Culture App",
        "url": "https://app.buildingculture.capital",
        "description": "The operating system of Building Culture. Manage assets, participate in opportunities, explore projects.",
        "tag": "Core Platform",
        "status": "beta",
        "layer": "core",
    },
    {
        "id": "bc-home",
        "name": "Building Culture Home",
        "url": "https://home.buildingculture.capital",
        "description": "Discover homes, properties and future living opportunities powered by community and technology.",
        "tag": "Living Platform",
        "status": "beta",
        "layer": "living",
    },
    {
        "id": "bc-id",
        "name": "Building Culture ID",
        "url": "https://buildingcultureid.space",
        "description": "Create your onchain identity. Own your digital reputation. Build your profile across the ecosystem.",
        "tag": "Identity Layer",
        "status": "live",
        "layer": "identity",
    },
    {
        "id": "bc-art",
        "name": "Building Culture Art",
        "url": "https://art.buildingcultureid.space",
        "description": "A place for real artwork, digital collectibles, cultural storytelling, and future onchain art experiences.",
        "tag": "Art & Culture Layer",
        "status": "live",
        "layer": "art",
    },
    {
        "id": "wohnai",
        "name": "WohnAI",
        "url": "https://wohnai.buildingcultureid.space/",
        "description": "The AI real estate agent for Vienna and Austria. Find rentals, homes, investments via a ChatGPT-like interface.",
        "tag": "AI Real Estate Agent",
        "status": "live",
        "layer": "ai",
    },
    {
        "id": "bc-game",
        "name": "Building Culture Game",
        "url": "https://game.buildingculture.capital",
        "description": "Learn, explore and engage through gamified experiences that reward participation.",
        "tag": "Engagement Layer",
        "status": "beta",
        "layer": "engagement",
    },
    {
        "id": "bc-miniapp",
        "name": "Building Culture MiniApp",
        "url": None,
        "description": "The gateway for new users. Simple onboarding. Community rewards. Tasks. XP. Achievements. Future token claims.",
        "tag": "Growth Engine",
        "status": "coming-soon",
        "layer": "growth",
    },
]


# ----------------- Routes -----------------
@api_router.get("/")
async def root():
    return {"message": "Building Culture API", "version": "1.0.0"}


@api_router.get("/ecosystem", response_model=List[EcosystemApp])
async def get_ecosystem():
    return [EcosystemApp(**item) for item in ECOSYSTEM]


@api_router.post("/waitlist", response_model=WaitlistEntry)
async def join_waitlist(payload: WaitlistCreate):
    existing = await db.waitlist.find_one({"email": payload.email}, {"_id": 0})
    if existing:
        # idempotent — return existing entry
        return WaitlistEntry(**existing)
    entry = WaitlistEntry(**payload.model_dump())
    await db.waitlist.insert_one(entry.model_dump())
    return entry


@api_router.get("/waitlist/count")
async def waitlist_count():
    count = await db.waitlist.count_documents({})
    return {"count": count}


@api_router.post("/analytics")
async def track_event(event: AnalyticsEvent, request: Request):
    doc = {
        "id": str(uuid.uuid4()),
        "event": event.event,
        "section": event.section,
        "meta": event.meta or {},
        "ip": request.client.host if request.client else None,
        "ua": request.headers.get("user-agent"),
        "created_at": now_iso(),
    }
    await db.analytics.insert_one(doc)
    return {"ok": True}


@api_router.get("/stats")
async def stats():
    waitlist = await db.waitlist.count_documents({})
    events = await db.analytics.count_documents({})
    return {
        "waitlist": waitlist,
        "events_tracked": events,
        "ecosystem_products": len(ECOSYSTEM),
        "communities_seeded": 12,
        "properties_in_pipeline": 47,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
