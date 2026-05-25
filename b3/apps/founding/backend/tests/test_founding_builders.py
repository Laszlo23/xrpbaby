"""End-to-end backend tests for The Founding Builders API."""
import os
import time
import uuid

import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://culture-quest-15.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _rand(prefix="user"):
    return f"TEST_{prefix}_{uuid.uuid4().hex[:8]}"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def primary_user(session):
    """Register a fresh primary user and return its token + record."""
    username = _rand("primary")
    email = f"{username}@test.io".lower()
    password = "buildit123"
    r = session.post(f"{API}/auth/register", json={"username": username, "email": email, "password": password})
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]
    me = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    return {"token": token, "username": username, "email": email, "password": password, "user": me.json()}


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ------------------ AUTH ------------------
class TestAuth:
    def test_register_returns_token_and_defaults(self, session):
        username = _rand("reg")
        r = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        assert r.status_code == 200, r.text
        token = r.json()["access_token"]
        assert isinstance(token, str) and len(token) > 20

        me = session.get(f"{API}/auth/me", headers=auth(token)).json()
        assert me["username"] == username
        assert "_id" not in me
        assert me["xp"] == 0
        assert me["mystery_boxes"] == 1
        assert me["badges"] == ["explorer"]
        assert isinstance(me["referral_code"], str) and len(me["referral_code"]) == 8
        assert me["level"]["current"]["id"] == 1
        assert "next" in me["level"] and "progress" in me["level"]

    def test_register_with_referral_awards_referrer(self, session, primary_user):
        ref_code = primary_user["user"]["referral_code"]
        username = _rand("ref")
        r = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123", "referral_code": ref_code})
        assert r.status_code == 200, r.text
        # check referrer state
        me = session.get(f"{API}/auth/me", headers=auth(primary_user["token"])).json()
        assert me["referral_count"] >= 1
        assert me["xp"] >= 1000  # friend_registers bonus

    def test_login_success(self, session, primary_user):
        r = session.post(f"{API}/auth/login", json={"email": primary_user["email"], "password": primary_user["password"]})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self, session, primary_user):
        r = session.post(f"{API}/auth/login", json={"email": primary_user["email"], "password": "wrongpw"})
        assert r.status_code == 401

    def test_me_requires_auth(self, session):
        r = session.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_duplicate_registration_rejected(self, session, primary_user):
        r = session.post(f"{API}/auth/register", json={"username": primary_user["username"], "email": primary_user["email"], "password": "buildit123"})
        assert r.status_code == 400


# ------------------ PUBLIC ------------------
class TestPublic:
    def test_countdown(self, session):
        r = session.get(f"{API}/countdown")
        assert r.status_code == 200
        d = r.json()
        assert d["target_utc"] == "2026-05-30T12:00:00Z"
        for k in ("days", "hours", "minutes", "seconds", "seconds_remaining"):
            assert k in d

    def test_stats(self, session):
        r = session.get(f"{API}/stats")
        assert r.status_code == 200
        assert r.json()["total_builders"] >= 1

    def test_feed_recent_items(self, session):
        r = session.get(f"{API}/feed")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        if items:
            assert "_id" not in items[0]
            assert "kind" in items[0] and "username" in items[0]

    @pytest.mark.parametrize("category", ["xp", "referrers", "founders"])
    def test_leaderboard(self, session, category):
        r = session.get(f"{API}/leaderboard", params={"category": category})
        assert r.status_code == 200
        rows = r.json()
        assert isinstance(rows, list)
        if rows:
            assert rows[0]["rank"] == 1
            assert "level" in rows[0]
            assert "_id" not in rows[0]


# ------------------ ECOSYSTEM ------------------
class TestEcosystem:
    def test_list_apps(self, session):
        r = session.get(f"{API}/ecosystem")
        assert r.status_code == 200
        apps = r.json()
        assert len(apps) == 7
        for a in apps:
            assert {"slug", "name", "url", "xp", "description"} <= set(a.keys())

    def test_visit_awards_once(self, session, primary_user):
        token = primary_user["token"]
        r1 = session.post(f"{API}/ecosystem/visit", json={"app_slug": "bc-id"}, headers=auth(token))
        assert r1.status_code == 200
        body1 = r1.json()
        assert body1["awarded"] is True
        assert body1["xp"] == 200
        r2 = session.post(f"{API}/ecosystem/visit", json={"app_slug": "bc-id"}, headers=auth(token))
        assert r2.status_code == 200
        assert r2.json()["awarded"] is False

    def test_visit_unknown_app(self, session, primary_user):
        r = session.post(f"{API}/ecosystem/visit", json={"app_slug": "nope"}, headers=auth(primary_user["token"]))
        assert r.status_code == 404


# ------------------ QUESTS ------------------
class TestQuests:
    def test_daily_quests_returns_three(self, session, primary_user):
        token = primary_user["token"]
        r = session.get(f"{API}/quests/daily", headers=auth(token))
        assert r.status_code == 200
        qs = r.json()
        assert len(qs) == 3
        assert all("completed" in q for q in qs)

    def test_complete_quest_idempotent(self, session, primary_user):
        token = primary_user["token"]
        qs = session.get(f"{API}/quests/daily", headers=auth(token)).json()
        slug = qs[0]["slug"]
        r1 = session.post(f"{API}/quests/complete", json={"quest_slug": slug}, headers=auth(token))
        assert r1.status_code == 200
        # Either it was already complete (awarded False) or now awarded True; second call should be False either way
        first_awarded = r1.json()["awarded"]
        r2 = session.post(f"{API}/quests/complete", json={"quest_slug": slug}, headers=auth(token))
        assert r2.status_code == 200
        assert r2.json()["awarded"] is False
        if first_awarded:
            assert r1.json()["xp"] == 200

    def test_community_missions(self, session):
        r = session.get(f"{API}/quests/community")
        assert r.status_code == 200
        rows = r.json()
        assert len(rows) == 5
        for m in rows:
            assert "progress" in m and "percent" in m
            assert 0 <= m["percent"] <= 1


# ------------------ MYSTERY BOX ------------------
class TestMysteryBox:
    def test_open_consumes_and_rewards(self, session, primary_user):
        token = primary_user["token"]
        me_before = session.get(f"{API}/auth/me", headers=auth(token)).json()
        boxes_before = me_before["mystery_boxes"]
        if boxes_before < 1:
            pytest.skip("primary user has no boxes (consumed by earlier flow)")
        r = session.post(f"{API}/mystery-box/open", headers=auth(token))
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["reward"]["type"] in ("key", "xp", "boost")
        assert body["user"]["mystery_boxes"] == boxes_before - 1

    def test_open_no_boxes_400(self, session):
        # fresh user, open both starter box then try to open a second
        username = _rand("mb")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]
        # consume starter box
        r1 = session.post(f"{API}/mystery-box/open", headers=auth(token))
        assert r1.status_code == 200
        r2 = session.post(f"{API}/mystery-box/open", headers=auth(token))
        assert r2.status_code == 400


# ------------------ SPIN ------------------
class TestSpin:
    def test_spin_then_cooldown(self, session):
        username = _rand("spin")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]
        st1 = session.get(f"{API}/spin/status", headers=auth(token)).json()
        assert st1["can_spin"] is True
        sp = session.post(f"{API}/spin", headers=auth(token))
        assert sp.status_code == 200
        body = sp.json()
        assert "segment_index" in body and "segment" in body
        st2 = session.get(f"{API}/spin/status", headers=auth(token)).json()
        assert st2["can_spin"] is False
        again = session.post(f"{API}/spin", headers=auth(token))
        assert again.status_code == 400
        assert "Spin not ready" in again.json().get("detail", "")

    def test_spin_requires_auth(self, session):
        r = session.post(f"{API}/spin")
        assert r.status_code in (401, 403)


# ------------------ PROFILE ------------------
class TestProfile:
    def test_complete_profile_awards_once_and_levels_up(self, session):
        username = _rand("prof")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]

        r1 = session.patch(f"{API}/profile", json={"avatar": "https://x/a.png", "bio": "Reb"}, headers=auth(token))
        assert r1.status_code == 200
        u1 = r1.json()
        assert u1["profile_completed"] is True
        assert u1["xp"] == 100
        # Second call should not re-award
        r2 = session.patch(f"{API}/profile", json={"bio": "Reb2"}, headers=auth(token))
        u2 = r2.json()
        assert u2["xp"] == 100

    def test_daily_login_idempotent_per_day(self, session):
        username = _rand("dl")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]
        r1 = session.post(f"{API}/profile/daily-login", headers=auth(token)).json()
        assert r1["awarded"] is True
        assert r1["user"]["xp"] == 25
        r2 = session.post(f"{API}/profile/daily-login", headers=auth(token)).json()
        assert r2["awarded"] is False


# ------------------ SHARE ------------------
class TestShare:
    def test_share_endpoints_xp(self, session):
        username = _rand("share")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]
        rx = session.post(f"{API}/share/x", headers=auth(token)).json()
        assert rx["xp"] == 150
        rf = session.post(f"{API}/share/farcaster", headers=auth(token)).json()
        assert rf["xp"] == 150
        rt = session.post(f"{API}/share/telegram", headers=auth(token)).json()
        assert rt["xp"] == 100
        # Final xp should be 400 (150+150+100)
        me = session.get(f"{API}/auth/me", headers=auth(token)).json()
        assert me["xp"] == 400


# ------------------ LEVELING ------------------
class TestLeveling:
    def test_level_up_to_builder_at_500(self, session):
        username = _rand("lvl")
        rr = session.post(f"{API}/auth/register", json={"username": username, "email": f"{username}@t.io", "password": "buildit123"})
        token = rr.json()["access_token"]
        # 150+150+100 = 400, then visit bc-id +200 = 600 → Builder
        for ep in ("/share/x", "/share/farcaster", "/share/telegram"):
            session.post(f"{API}{ep}", headers=auth(token))
        session.post(f"{API}/ecosystem/visit", json={"app_slug": "bc-id"}, headers=auth(token))
        me = session.get(f"{API}/auth/me", headers=auth(token)).json()
        assert me["xp"] >= 500
        assert me["level"]["current"]["id"] == 2
        assert me["level"]["current"]["name"] == "Builder"
        assert "builder" in me["badges"]


# ------------------ MAYOR ------------------
class TestMayor:
    def test_mayor_chat_and_history(self, session, primary_user):
        token = primary_user["token"]
        r = session.post(f"{API}/mayor/chat", json={"message": "Hello Mayor, give me one mission."}, headers=auth(token), timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert isinstance(body["reply"], str) and len(body["reply"]) > 10
        assert body["session_id"]
        time.sleep(0.5)
        hist = session.get(f"{API}/mayor/history", headers=auth(token)).json()
        assert isinstance(hist, list) and len(hist) >= 2
        assert hist[0]["role"] in ("user", "mayor")
        assert "_id" not in hist[0]


# ------------------ AUTH GUARDS ------------------
class TestAuthGuards:
    @pytest.mark.parametrize("method,path", [
        ("get", "/auth/me"),
        ("patch", "/profile"),
        ("post", "/profile/daily-login"),
        ("post", "/spin"),
        ("get", "/spin/status"),
        ("post", "/mystery-box/open"),
        ("post", "/quests/complete"),
        ("get", "/quests/daily"),
        ("post", "/ecosystem/visit"),
        ("post", "/share/x"),
        ("post", "/mayor/chat"),
        ("get", "/mayor/history"),
    ])
    def test_protected_endpoints_require_auth(self, session, method, path):
        fn = getattr(session, method)
        kwargs = {}
        if method in ("post", "patch"):
            kwargs["json"] = {}
        r = fn(f"{API}{path}", **kwargs)
        assert r.status_code in (401, 403), f"{method.upper()} {path} returned {r.status_code}"
