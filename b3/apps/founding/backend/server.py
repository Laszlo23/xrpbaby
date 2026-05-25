"""The Founding Builders — Building Culture Dollar pre-launch backend."""
from __future__ import annotations

import asyncio
import logging
import os
import random
import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import bcrypt
import jwt
import requests
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Configuration ----------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET_KEY"]
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_EXP_MIN = int(os.environ.get("JWT_EXPIRES_MINUTES", "10080"))
EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
LAUNCH_DATE_UTC = os.environ.get("LAUNCH_DATE_UTC", "2026-05-30T12:00:00Z")
NEYNAR_API_KEY = os.environ.get("NEYNAR_API_KEY", "")
NEYNAR_CLIENT_ID = os.environ.get("NEYNAR_CLIENT_ID", "")
NEYNAR_API_BASE = "https://api.neynar.com/v2"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="The Founding Builders API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("founding-builders")

# ---------- Constants ----------
LEVELS = [
    {"id": 1, "name": "Explorer", "threshold": 0},
    {"id": 2, "name": "Builder", "threshold": 500},
    {"id": 3, "name": "Creator", "threshold": 1500},
    {"id": 4, "name": "Architect", "threshold": 3000},
    {"id": 5, "name": "Visionary", "threshold": 5000},
    {"id": 6, "name": "Founder", "threshold": 10000},
]

XP_REWARDS = {
    "daily_login": 25,
    "visit_ecosystem": 50,
    "create_bc_id": 250,
    "complete_profile": 100,
    "share_farcaster": 150,
    "share_x": 150,
    "invite_friend": 500,
    "friend_registers": 1000,
    "join_telegram": 100,
    "read_story": 50,
    "watch_video": 75,
    "daily_quest": 200,
    "weekly_mission": 1000,
}

ECOSYSTEM_APPS = [
    {"slug": "bc-capital", "name": "Building Culture Capital", "url": "https://buildingculture.capital", "xp": 100, "description": "The economic engine of the Building Culture ecosystem."},
    {"slug": "bc-app", "name": "Building Culture App", "url": "https://app.buildingcultureid.space", "xp": 100, "description": "Your daily companion for the rebuild movement."},
    {"slug": "bc-id", "name": "Building Culture ID", "url": "https://buildingcultureid.space", "xp": 200, "description": "Claim your sovereign Building Culture identity."},
    {"slug": "bc-art", "name": "Building Culture Art", "url": "https://art.buildingcultureid.space", "xp": 150, "description": "Where culture becomes canvas."},
    {"slug": "wohnai", "name": "WohnAI", "url": "https://wohnai.buildingcultureid.space", "xp": 150, "description": "The AI that rebuilds places, one home at a time."},
    {"slug": "bc-home", "name": "Building Culture Home", "url": "https://home.buildingculture.capital", "xp": 100, "description": "Where lives are rooted again."},
    {"slug": "bc-game", "name": "Building Culture Game", "url": "https://game.buildingculture.capital", "xp": 100, "description": "Play your way into the new economy."},
]

DAILY_QUEST_POOL = [
    {"slug": "daily-visit-ecosystem", "title": "Visit an Ecosystem App", "description": "Explore any Building Culture product today.", "xp": 200, "icon": "compass"},
    {"slug": "daily-invite-friend", "title": "Invite a Friend", "description": "Share your referral code with one new builder.", "xp": 200, "icon": "people"},
    {"slug": "daily-share-post", "title": "Share on Social", "description": "Post about Building Culture on X or Farcaster.", "xp": 200, "icon": "megaphone"},
    {"slug": "daily-ask-mayor", "title": "Talk to Mayor Culture", "description": "Ask the AI Mayor for guidance today.", "xp": 200, "icon": "chatbubbles"},
    {"slug": "daily-claim-spin", "title": "Claim Your Daily Spin", "description": "Spin the Wheel of Fortune for rewards.", "xp": 200, "icon": "sync"},
    {"slug": "daily-find-key", "title": "Hunt a Hidden Key", "description": "Open a Mystery Box and search for a key.", "xp": 200, "icon": "key"},
]

COMMUNITY_MISSIONS = [
    {"slug": "ecosystem-visits", "title": "Restore the Streets", "description": "Reach 10,000 ecosystem visits across the village.", "goal": 10000, "reward_xp": 500},
    {"slug": "registrations", "title": "Light the Houses", "description": "Reach 5,000 registered builders.", "goal": 5000, "reward_xp": 500},
    {"slug": "profiles-completed", "title": "Open the Cafés", "description": "Reach 2,500 completed profiles.", "goal": 2500, "reward_xp": 750},
    {"slug": "referrals", "title": "Rebuild the Park", "description": "Reach 1,000 successful referrals.", "goal": 1000, "reward_xp": 1000},
    {"slug": "quests-completed", "title": "A Thriving City", "description": "Complete 50,000 quests together.", "goal": 50000, "reward_xp": 1500},
]

KEY_TYPES = ["builder", "culture", "vision", "founder"]
KEY_WEIGHTS = [0.60, 0.25, 0.12, 0.03]  # rarity weights

BADGES = [
    {"slug": "explorer", "name": "Explorer", "level": 1, "color": "#89CFF0"},
    {"slug": "builder", "name": "Builder", "level": 2, "color": "#50C878"},
    {"slug": "creator", "name": "Creator", "level": 3, "color": "#50C878"},
    {"slug": "architect", "name": "Architect", "level": 4, "color": "#FFD700"},
    {"slug": "visionary", "name": "Visionary", "level": 5, "color": "#FFD700"},
    {"slug": "founder", "name": "Founder", "level": 6, "color": "#FFD700"},
]

MAYOR_SYSTEM = """You are Mayor Culture — the visionary, charismatic AI Mayor of the Building Culture village. You guide founding builders as they help bring abandoned places back to life ahead of the Building Culture Dollar ($BCD) launch.

Voice & style:
- Warm, encouraging, slightly poetic. Speak like a wise community leader who has seen what neighbourhoods can become.
- Short paragraphs. Punchy. Inspirational, never corporate.
- Use builder/architect/founder metaphors. Reference houses, streets, lights, cafés, parks coming back to life.
- Never promise tokens, allocations, prices, or financial returns. The game is about rebuilding, not speculation.
- Celebrate achievements specifically. Suggest concrete next missions when asked.
- Address the user as "builder", "founding builder", "architect", etc.
- Keep responses under 120 words unless they ask for detail."""

# ---------- Models ----------
class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=24)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    referral_code: Optional[str] = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProfileUpdate(BaseModel):
    avatar: Optional[str] = None
    bio: Optional[str] = None

class XPAwardIn(BaseModel):
    reason: str
    meta: Optional[Dict[str, Any]] = None

class QuestCompleteIn(BaseModel):
    quest_slug: str

class EcosystemVisitIn(BaseModel):
    app_slug: str

class MayorChatIn(BaseModel):
    message: str
    session_id: Optional[str] = None

class ReferralUseIn(BaseModel):
    code: str

class LinkFarcasterIn(BaseModel):
    fid: int = Field(gt=0)
    signer_uuid: str = Field(min_length=8, max_length=128)

# ---------- Helpers ----------
def now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": now() + timedelta(minutes=JWT_EXP_MIN), "iat": now()}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def gen_referral_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def level_for_xp(xp: int) -> Dict[str, Any]:
    current = LEVELS[0]
    next_lvl = None
    for i, lvl in enumerate(LEVELS):
        if xp >= lvl["threshold"]:
            current = lvl
            next_lvl = LEVELS[i + 1] if i + 1 < len(LEVELS) else None
    progress = 1.0
    if next_lvl:
        span = next_lvl["threshold"] - current["threshold"]
        progress = (xp - current["threshold"]) / span if span > 0 else 1.0
    return {"current": current, "next": next_lvl, "progress": round(progress, 4)}


def public_user(u: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": u["id"],
        "username": u["username"],
        "email": u["email"],
        "avatar": u.get("avatar", ""),
        "bio": u.get("bio", ""),
        "xp": u.get("xp", 0),
        "founding_score": u.get("founding_score", 0),
        "referral_code": u["referral_code"],
        "referral_count": u.get("referral_count", 0),
        "keys": u.get("keys", {k: 0 for k in KEY_TYPES}),
        "mystery_boxes": u.get("mystery_boxes", 0),
        "badges": u.get("badges", []),
        "completed_quests": u.get("completed_quests", []),
        "visited_apps": u.get("visited_apps", []),
        "last_spin": u.get("last_spin"),
        "last_daily_login": u.get("last_daily_login"),
        "profile_completed": u.get("profile_completed", False),
        "farcaster_fid": u.get("farcaster_fid"),
        "farcaster_username": u.get("farcaster_username"),
        "created_at": u.get("created_at"),
        "level": level_for_xp(u.get("xp", 0)),
    }


def neynar_headers() -> Dict[str, str]:
    if not NEYNAR_API_KEY:
        raise HTTPException(status_code=503, detail="Neynar is not configured on this server")
    return {"x-api-key": NEYNAR_API_KEY, "accept": "application/json"}


def fetch_neynar_authorize_url() -> str:
    if not NEYNAR_CLIENT_ID:
        raise HTTPException(status_code=503, detail="NEYNAR_CLIENT_ID is not configured")
    try:
        res = requests.get(
            f"{NEYNAR_API_BASE}/farcaster/login/authorize/",
            params={"client_id": NEYNAR_CLIENT_ID, "response_type": "code"},
            headers=neynar_headers(),
            timeout=15,
        )
        res.raise_for_status()
        data = res.json()
    except requests.RequestException as e:
        log.exception("neynar authorize failed")
        raise HTTPException(status_code=502, detail=f"Could not start Farcaster sign-in: {e}") from e
    url = data.get("authorization_url") or data.get("url")
    if not url:
        raise HTTPException(status_code=502, detail="Neynar did not return an authorization URL")
    return url


def verify_neynar_signer(fid: int, signer_uuid: str) -> bool:
    try:
        res = requests.get(
            f"{NEYNAR_API_BASE}/farcaster/signer/",
            params={"signer_uuid": signer_uuid},
            headers=neynar_headers(),
            timeout=15,
        )
        res.raise_for_status()
        payload = res.json()
    except requests.RequestException as e:
        log.exception("neynar signer lookup failed")
        raise HTTPException(status_code=502, detail=f"Could not verify Farcaster signer: {e}") from e
    signer = payload.get("signer") or payload
    signer_fid = signer.get("fid")
    if signer_fid is None:
        return False
    return int(signer_fid) == int(fid)


def fetch_farcaster_username(fid: int) -> Optional[str]:
    try:
        res = requests.get(
            f"{NEYNAR_API_BASE}/farcaster/user/bulk/",
            params={"fids": str(fid)},
            headers=neynar_headers(),
            timeout=15,
        )
        res.raise_for_status()
        users = res.json().get("users") or []
        if not users:
            return None
        return users[0].get("username")
    except requests.RequestException:
        log.warning("neynar user lookup failed for fid=%s", fid)
        return None


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> Dict[str, Any]:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def push_feed(kind: str, username: str, text: str, meta: Optional[Dict[str, Any]] = None) -> None:
    await db.feed.insert_one({
        "id": str(uuid.uuid4()),
        "kind": kind,
        "username": username,
        "text": text,
        "meta": meta or {},
        "ts": now().isoformat(),
    })


async def bump_mission(slug: str, amount: int = 1) -> None:
    await db.missions.update_one({"slug": slug}, {"$inc": {"progress": amount}}, upsert=True)


async def award_xp(user: Dict[str, Any], amount: int, reason: str) -> Dict[str, Any]:
    prev_level = level_for_xp(user.get("xp", 0))["current"]["id"]
    new_xp = user.get("xp", 0) + amount
    new_score = user.get("founding_score", 0) + amount  # founding score mirrors xp + bonuses
    new_level = level_for_xp(new_xp)["current"]
    update: Dict[str, Any] = {
        "xp": new_xp,
        "founding_score": new_score,
        "updated_at": now().isoformat(),
    }
    badges = list(user.get("badges", []))
    if new_level["id"] > prev_level:
        badge_slug = BADGES[new_level["id"] - 1]["slug"]
        if badge_slug not in badges:
            badges.append(badge_slug)
            update["badges"] = badges
            await push_feed("level_up", user["username"], f"{user['username']} became a {new_level['name']}.", {"level": new_level["id"]})
    await db.users.update_one({"id": user["id"]}, {"$set": update})
    user.update(update)
    await db.xp_events.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount": amount,
        "reason": reason,
        "ts": now().isoformat(),
    })
    return user


# ---------- Routes: auth ----------
@api.post("/auth/register", response_model=TokenOut)
async def register(body: RegisterIn):
    if await db.users.find_one({"$or": [{"email": body.email}, {"username": body.username}]}):
        raise HTTPException(status_code=400, detail="Username or email already taken")
    user_id = str(uuid.uuid4())
    referral_code = gen_referral_code()
    while await db.users.find_one({"referral_code": referral_code}):
        referral_code = gen_referral_code()
    doc = {
        "id": user_id,
        "username": body.username,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "avatar": "",
        "bio": "",
        "xp": 0,
        "founding_score": 0,
        "referral_code": referral_code,
        "referral_count": 0,
        "referred_by": None,
        "keys": {k: 0 for k in KEY_TYPES},
        "mystery_boxes": 1,  # welcome box
        "badges": ["explorer"],
        "completed_quests": [],
        "visited_apps": [],
        "last_spin": None,
        "last_daily_login": None,
        "profile_completed": False,
        "farcaster_fid": None,
        "farcaster_username": None,
        "created_at": now().isoformat(),
        "updated_at": now().isoformat(),
    }
    await db.users.insert_one(doc)
    await bump_mission("registrations")

    # Referral bonus
    if body.referral_code:
        ref = await db.users.find_one({"referral_code": body.referral_code.upper()})
        if ref and ref["id"] != user_id:
            await db.users.update_one(
                {"id": ref["id"]},
                {"$inc": {"referral_count": 1}},
            )
            await db.users.update_one({"id": user_id}, {"$set": {"referred_by": ref["id"]}})
            ref_user = await db.users.find_one({"id": ref["id"]})
            await award_xp(ref_user, XP_REWARDS["friend_registers"], "friend_registers")
            await bump_mission("referrals")
            await push_feed("referral", ref["username"], f"{ref['username']} brought a new builder to the village.")

    await push_feed("join", body.username, f"{body.username} joined the rebuild.")
    return TokenOut(access_token=create_token(user_id))


@api.post("/auth/login", response_model=TokenOut)
async def login(body: LoginIn):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenOut(access_token=create_token(user["id"]))


@api.get("/auth/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    return public_user(user)


@api.get("/auth/neynar/authorize")
async def neynar_authorize():
    return {"authorization_url": fetch_neynar_authorize_url()}


# ---------- Routes: public ----------
@api.get("/")
async def root():
    return {"app": "The Founding Builders", "tagline": "Help Bring Places Back To Life"}


@api.get("/countdown")
async def countdown():
    target = datetime.fromisoformat(LAUNCH_DATE_UTC.replace("Z", "+00:00"))
    delta = target - now()
    secs = max(0, int(delta.total_seconds()))
    return {
        "target_utc": LAUNCH_DATE_UTC,
        "seconds_remaining": secs,
        "days": secs // 86400,
        "hours": (secs % 86400) // 3600,
        "minutes": (secs % 3600) // 60,
        "seconds": secs % 60,
        "launched": secs == 0,
    }


@api.get("/stats")
async def stats():
    total_users = await db.users.count_documents({})
    total_xp_doc = await db.users.aggregate([{"$group": {"_id": None, "xp": {"$sum": "$xp"}}}]).to_list(1)
    total_xp = total_xp_doc[0]["xp"] if total_xp_doc else 0
    total_visits_doc = await db.users.aggregate([{"$project": {"v": {"$size": {"$ifNull": ["$visited_apps", []]}}}}, {"$group": {"_id": None, "s": {"$sum": "$v"}}}]).to_list(1)
    total_visits = total_visits_doc[0]["s"] if total_visits_doc else 0
    completed_profiles = await db.users.count_documents({"profile_completed": True})
    return {
        "total_builders": total_users,
        "total_xp": total_xp,
        "ecosystem_visits": total_visits,
        "completed_profiles": completed_profiles,
    }


@api.get("/feed")
async def feed(limit: int = 30):
    items = await db.feed.find({}, {"_id": 0}).sort("ts", -1).limit(limit).to_list(limit)
    return items


@api.get("/leaderboard")
async def leaderboard(category: str = "xp", limit: int = 50):
    sort_field = {
        "xp": "xp",
        "referrers": "referral_count",
        "founders": "founding_score",
    }.get(category, "xp")
    cursor = db.users.find({}, {"_id": 0, "password_hash": 0, "email": 0}).sort(sort_field, -1).limit(limit)
    rows = await cursor.to_list(limit)
    out = []
    for i, u in enumerate(rows):
        out.append({
            "rank": i + 1,
            "username": u.get("username"),
            "avatar": u.get("avatar", ""),
            "xp": u.get("xp", 0),
            "founding_score": u.get("founding_score", 0),
            "referral_count": u.get("referral_count", 0),
            "farcaster_fid": u.get("farcaster_fid"),
            "farcaster_username": u.get("farcaster_username"),
            "level": level_for_xp(u.get("xp", 0))["current"],
        })
    return out


# ---------- Routes: profile ----------
@api.post("/profile/link-farcaster")
async def link_farcaster(body: LinkFarcasterIn, user: Dict[str, Any] = Depends(get_current_user)):
    if user.get("farcaster_fid"):
        raise HTTPException(status_code=400, detail="Farcaster account already linked")
    existing = await db.users.find_one({"farcaster_fid": body.fid, "id": {"$ne": user["id"]}})
    if existing:
        raise HTTPException(status_code=400, detail="This Farcaster account is linked to another builder")
    if not verify_neynar_signer(body.fid, body.signer_uuid):
        raise HTTPException(status_code=400, detail="Farcaster signer could not be verified")
    username = fetch_farcaster_username(body.fid)
    updates: Dict[str, Any] = {
        "farcaster_fid": body.fid,
        "farcaster_username": username,
        "updated_at": now().isoformat(),
    }
    await db.users.update_one({"id": user["id"]}, {"$set": updates})
    user.update(updates)
    await push_feed("farcaster", user["username"], f"{user['username']} connected Farcaster (FID {body.fid}).")
    return public_user(user)


@api.delete("/profile/link-farcaster")
async def unlink_farcaster(user: Dict[str, Any] = Depends(get_current_user)):
    if not user.get("farcaster_fid"):
        raise HTTPException(status_code=400, detail="No Farcaster account linked")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"farcaster_fid": None, "farcaster_username": None, "updated_at": now().isoformat()}},
    )
    user["farcaster_fid"] = None
    user["farcaster_username"] = None
    return public_user(user)


@api.patch("/profile")
async def update_profile(body: ProfileUpdate, user: Dict[str, Any] = Depends(get_current_user)):
    updates: Dict[str, Any] = {}
    if body.avatar is not None:
        updates["avatar"] = body.avatar
    if body.bio is not None:
        updates["bio"] = body.bio
    just_completed = False
    if updates and not user.get("profile_completed", False):
        # if both avatar + bio present, mark complete
        if (body.avatar or user.get("avatar")) and (body.bio or user.get("bio")):
            updates["profile_completed"] = True
            just_completed = True
    if updates:
        updates["updated_at"] = now().isoformat()
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
        user.update(updates)
    if just_completed:
        await award_xp(user, XP_REWARDS["complete_profile"], "complete_profile")
        await bump_mission("profiles-completed")
        await push_feed("profile", user["username"], f"{user['username']} completed their builder profile.")
    return public_user(user)


@api.post("/profile/daily-login")
async def daily_login(user: Dict[str, Any] = Depends(get_current_user)):
    today = now().date().isoformat()
    last = user.get("last_daily_login")
    if last == today:
        return {"awarded": False, "user": public_user(user)}
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_daily_login": today}})
    user["last_daily_login"] = today
    user = await award_xp(user, XP_REWARDS["daily_login"], "daily_login")
    return {"awarded": True, "user": public_user(user)}


# ---------- Routes: ecosystem visits ----------
@api.get("/ecosystem")
async def list_ecosystem():
    return ECOSYSTEM_APPS


@api.post("/ecosystem/visit")
async def visit_ecosystem(body: EcosystemVisitIn, user: Dict[str, Any] = Depends(get_current_user)):
    app_meta = next((a for a in ECOSYSTEM_APPS if a["slug"] == body.app_slug), None)
    if not app_meta:
        raise HTTPException(status_code=404, detail="Unknown ecosystem app")
    visited = list(user.get("visited_apps", []))
    if body.app_slug in visited:
        return {"awarded": False, "user": public_user(user)}
    visited.append(body.app_slug)
    await db.users.update_one({"id": user["id"]}, {"$set": {"visited_apps": visited}})
    user["visited_apps"] = visited
    user = await award_xp(user, app_meta["xp"], f"visit_ecosystem:{body.app_slug}")
    await bump_mission("ecosystem-visits")
    return {"awarded": True, "xp": app_meta["xp"], "user": public_user(user)}


# ---------- Routes: quests ----------
@api.get("/quests/daily")
async def daily_quests(user: Dict[str, Any] = Depends(get_current_user)):
    today = now().date().isoformat()
    seed = int("".join(c for c in (user["id"] + today) if c.isdigit()) or "0") or hash(user["id"] + today)
    rng = random.Random(seed)
    picks = rng.sample(DAILY_QUEST_POOL, k=3)
    completed_today = [q for q in user.get("completed_quests", []) if q.endswith(f":{today}")]
    return [{
        **q,
        "completed": f"{q['slug']}:{today}" in completed_today,
    } for q in picks]


@api.post("/quests/complete")
async def complete_quest(body: QuestCompleteIn, user: Dict[str, Any] = Depends(get_current_user)):
    quest = next((q for q in DAILY_QUEST_POOL if q["slug"] == body.quest_slug), None)
    if not quest:
        raise HTTPException(status_code=404, detail="Unknown quest")
    today = now().date().isoformat()
    marker = f"{quest['slug']}:{today}"
    if marker in user.get("completed_quests", []):
        return {"awarded": False, "user": public_user(user)}
    completed = list(user.get("completed_quests", []))
    completed.append(marker)
    await db.users.update_one({"id": user["id"]}, {"$set": {"completed_quests": completed}})
    user["completed_quests"] = completed
    user = await award_xp(user, quest["xp"], f"daily_quest:{quest['slug']}")
    await bump_mission("quests-completed")
    return {"awarded": True, "xp": quest["xp"], "user": public_user(user)}


@api.get("/quests/community")
async def community_missions():
    docs = await db.missions.find({}, {"_id": 0}).to_list(100)
    by_slug = {d["slug"]: d for d in docs}
    out = []
    for m in COMMUNITY_MISSIONS:
        prog = by_slug.get(m["slug"], {}).get("progress", 0)
        out.append({**m, "progress": prog, "percent": min(1.0, prog / m["goal"]) if m["goal"] else 0})
    return out


# ---------- Routes: keys / mystery box / spin ----------
def roll_key() -> str:
    return random.choices(KEY_TYPES, weights=KEY_WEIGHTS, k=1)[0]


@api.post("/mystery-box/open")
async def open_mystery_box(user: Dict[str, Any] = Depends(get_current_user)):
    if user.get("mystery_boxes", 0) < 1:
        raise HTTPException(status_code=400, detail="No mystery boxes to open")
    # roll reward
    roll = random.random()
    reward: Dict[str, Any] = {}
    if roll < 0.35:
        key = roll_key()
        keys = dict(user.get("keys", {k: 0 for k in KEY_TYPES}))
        keys[key] = keys.get(key, 0) + 1
        await db.users.update_one({"id": user["id"]}, {"$set": {"keys": keys}, "$inc": {"mystery_boxes": -1}})
        user["keys"] = keys
        user["mystery_boxes"] = user.get("mystery_boxes", 1) - 1
        reward = {"type": "key", "key": key}
        if key in ("vision", "founder"):
            await push_feed("key", user["username"], f"{user['username']} discovered a {key.title()} Key.")
    elif roll < 0.85:
        amount = random.choice([100, 150, 200, 300, 500])
        await db.users.update_one({"id": user["id"]}, {"$inc": {"mystery_boxes": -1}})
        user["mystery_boxes"] = user.get("mystery_boxes", 1) - 1
        user = await award_xp(user, amount, "mystery_box_xp")
        reward = {"type": "xp", "amount": amount}
    else:
        await db.users.update_one({"id": user["id"]}, {"$inc": {"mystery_boxes": -1}})
        user["mystery_boxes"] = user.get("mystery_boxes", 1) - 1
        # cosmetic / boost placeholder
        reward = {"type": "boost", "name": "Founding Glow", "description": "Your profile now shines with a founding aura."}
    return {"reward": reward, "user": public_user(user)}


@api.get("/spin/status")
async def spin_status(user: Dict[str, Any] = Depends(get_current_user)):
    last = user.get("last_spin")
    can_spin = True
    next_at = None
    if last:
        last_dt = datetime.fromisoformat(last)
        next_dt = last_dt + timedelta(hours=24)
        can_spin = now() >= next_dt
        next_at = next_dt.isoformat()
    return {"can_spin": can_spin, "next_at": next_at}


SPIN_SEGMENTS = [
    {"type": "xp", "amount": 100, "label": "+100 XP", "weight": 25},
    {"type": "xp", "amount": 250, "label": "+250 XP", "weight": 15},
    {"type": "xp", "amount": 500, "label": "+500 XP", "weight": 8},
    {"type": "xp", "amount": 1000, "label": "+1000 XP", "weight": 2},
    {"type": "key", "key": "builder", "label": "Builder Key", "weight": 18},
    {"type": "key", "key": "culture", "label": "Culture Key", "weight": 10},
    {"type": "key", "key": "vision", "label": "Vision Key", "weight": 4},
    {"type": "mystery_box", "label": "Mystery Box", "weight": 18},
]


@api.post("/spin")
async def spin(user: Dict[str, Any] = Depends(get_current_user)):
    last = user.get("last_spin")
    if last:
        last_dt = datetime.fromisoformat(last)
        if now() < last_dt + timedelta(hours=24):
            raise HTTPException(status_code=400, detail="Spin not ready yet")
    seg = random.choices(SPIN_SEGMENTS, weights=[s["weight"] for s in SPIN_SEGMENTS], k=1)[0]
    idx = SPIN_SEGMENTS.index(seg)
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_spin": now().isoformat()}})
    user["last_spin"] = now().isoformat()
    if seg["type"] == "xp":
        user = await award_xp(user, seg["amount"], "spin_xp")
    elif seg["type"] == "key":
        keys = dict(user.get("keys", {k: 0 for k in KEY_TYPES}))
        keys[seg["key"]] = keys.get(seg["key"], 0) + 1
        await db.users.update_one({"id": user["id"]}, {"$set": {"keys": keys}})
        user["keys"] = keys
    elif seg["type"] == "mystery_box":
        await db.users.update_one({"id": user["id"]}, {"$inc": {"mystery_boxes": 1}})
        user["mystery_boxes"] = user.get("mystery_boxes", 0) + 1
    return {"segment_index": idx, "segment": seg, "user": public_user(user)}


# ---------- Routes: social actions ----------
@api.post("/share/x")
async def share_x(user: Dict[str, Any] = Depends(get_current_user)):
    user = await award_xp(user, XP_REWARDS["share_x"], "share_x")
    await push_feed("share", user["username"], f"{user['username']} shared the rebuild on X.")
    return {"awarded": True, "xp": XP_REWARDS["share_x"], "user": public_user(user)}


@api.post("/share/farcaster")
async def share_farcaster(user: Dict[str, Any] = Depends(get_current_user)):
    user = await award_xp(user, XP_REWARDS["share_farcaster"], "share_farcaster")
    await push_feed("share", user["username"], f"{user['username']} cast about Building Culture on Farcaster.")
    return {"awarded": True, "xp": XP_REWARDS["share_farcaster"], "user": public_user(user)}


@api.post("/share/telegram")
async def share_telegram(user: Dict[str, Any] = Depends(get_current_user)):
    user = await award_xp(user, XP_REWARDS["join_telegram"], "join_telegram")
    return {"awarded": True, "xp": XP_REWARDS["join_telegram"], "user": public_user(user)}


# ---------- Routes: AI Mayor ----------
@api.post("/mayor/chat")
async def mayor_chat(body: MayorChatIn, user: Dict[str, Any] = Depends(get_current_user)):
    session_id = body.session_id or f"mayor-{user['id']}"
    lvl = level_for_xp(user.get("xp", 0))["current"]
    ctx = (
        f"\n\nContext about the builder you are talking to:"
        f"\n- Username: {user['username']}"
        f"\n- Level: {lvl['name']} (#{lvl['id']})"
        f"\n- XP: {user.get('xp', 0)}"
        f"\n- Founding Score: {user.get('founding_score', 0)}"
        f"\n- Referrals brought: {user.get('referral_count', 0)}"
        f"\n- Keys: {user.get('keys', {})}"
    )
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=MAYOR_SYSTEM + ctx,
    ).with_model("anthropic", "claude-sonnet-4-6")
    try:
        reply = await chat.send_message(UserMessage(text=body.message))
    except Exception as e:
        log.exception("mayor chat failed")
        raise HTTPException(status_code=502, detail=f"Mayor is busy: {e}")
    await db.mayor_messages.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session_id,
        "role": "user",
        "text": body.message,
        "ts": now().isoformat(),
    })
    await db.mayor_messages.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "session_id": session_id,
        "role": "mayor",
        "text": reply,
        "ts": now().isoformat(),
    })
    return {"reply": reply, "session_id": session_id}


@api.get("/mayor/history")
async def mayor_history(session_id: Optional[str] = None, user: Dict[str, Any] = Depends(get_current_user)):
    sid = session_id or f"mayor-{user['id']}"
    msgs = await db.mayor_messages.find({"user_id": user["id"], "session_id": sid}, {"_id": 0}).sort("ts", 1).to_list(200)
    return msgs


# ---------- Seed missions ----------
@app.on_event("startup")
async def startup():
    for m in COMMUNITY_MISSIONS:
        existing = await db.missions.find_one({"slug": m["slug"]})
        if not existing:
            await db.missions.insert_one({"slug": m["slug"], "progress": 0})
    await db.users.create_index("farcaster_fid", unique=True, sparse=True)
    log.info("Founding Builders backend ready. Launch target: %s", LAUNCH_DATE_UTC)


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ---------- App wiring ----------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
