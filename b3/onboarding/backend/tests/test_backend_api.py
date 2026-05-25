"""Backend API tests for Building Culture landing page."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # frontend .env contains the public URL we should test against
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----------- Health -----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        body = r.json()
        assert "Building Culture" in body.get("message", "")
        assert "version" in body


# ----------- Ecosystem -----------
class TestEcosystem:
    def test_ecosystem_returns_8_items(self, client):
        r = client.get(f"{API}/ecosystem")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8
        required = {"id", "name", "description", "tag", "status", "layer"}
        for item in data:
            assert required.issubset(item.keys()), f"Missing keys in {item}"
            assert item["status"] in {"beta", "live", "coming-soon"}
        ids = [i["id"] for i in data]
        assert len(set(ids)) == 8  # unique ids

    def test_ecosystem_has_expected_statuses(self, client):
        r = client.get(f"{API}/ecosystem")
        data = r.json()
        statuses = {i["status"] for i in data}
        # Should include at least one of each status type per PRD
        assert "beta" in statuses
        assert "live" in statuses
        assert "coming-soon" in statuses


# ----------- Waitlist -----------
class TestWaitlist:
    def test_waitlist_invalid_email(self, client):
        r = client.post(f"{API}/waitlist", json={"email": "not-an-email"})
        assert r.status_code == 422

    def test_waitlist_create_and_idempotent(self, client):
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": unique_email, "name": "Test User", "role": "builder", "source": "pytest"}

        r1 = client.post(f"{API}/waitlist", json=payload)
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        assert d1["email"] == unique_email
        assert d1["name"] == "Test User"
        assert d1["role"] == "builder"
        assert "id" in d1
        assert "created_at" in d1

        # Idempotent — same email returns existing entry (same id)
        r2 = client.post(f"{API}/waitlist", json={"email": unique_email, "name": "Different Name"})
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["id"] == d1["id"], "Waitlist should be idempotent on email"

    def test_waitlist_count(self, client):
        r = client.get(f"{API}/waitlist/count")
        assert r.status_code == 200
        body = r.json()
        assert "count" in body
        assert isinstance(body["count"], int)
        assert body["count"] >= 0


# ----------- Analytics -----------
class TestAnalytics:
    def test_track_event(self, client):
        payload = {"event": "test_click", "section": "hero", "meta": {"src": "pytest"}}
        r = client.post(f"{API}/analytics", json=payload)
        assert r.status_code == 200
        assert r.json() == {"ok": True}

    def test_track_event_minimal(self, client):
        r = client.post(f"{API}/analytics", json={"event": "minimal_event"})
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ----------- Stats -----------
class TestStats:
    def test_stats_shape(self, client):
        r = client.get(f"{API}/stats")
        assert r.status_code == 200
        d = r.json()
        for key in ["waitlist", "events_tracked", "ecosystem_products", "communities_seeded", "properties_in_pipeline"]:
            assert key in d, f"Missing key: {key}"
        assert d["ecosystem_products"] == 8
        assert d["communities_seeded"] == 12
        assert d["properties_in_pipeline"] == 47
        assert isinstance(d["waitlist"], int)
        assert isinstance(d["events_tracked"], int)

    def test_stats_waitlist_increments(self, client):
        before = client.get(f"{API}/stats").json()["waitlist"]
        new_email = f"TEST_stats_{uuid.uuid4().hex[:8]}@example.com"
        client.post(f"{API}/waitlist", json={"email": new_email})
        after = client.get(f"{API}/stats").json()["waitlist"]
        assert after >= before + 1
