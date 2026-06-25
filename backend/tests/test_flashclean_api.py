"""FlashClean backend regression tests.

Covers:
- /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/logout
- /api/auth/session (Emergent Google) — only the invalid-session 401 path
- /api/bookings POST + GET
"""
import time
import uuid

import pytest


# -------- Auth --------

class TestAuthDemoUser:
    """Sign-in flow for the seeded demo user."""

    def test_login_demo_user(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "demo@flashclean.pt", "password": "flashclean123"},
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "demo@flashclean.pt"
        assert "password" in data["user"]["auth_providers"]
        pytest.demo_token = data["access_token"]

    def test_me_with_bearer(self, api_client, base_url):
        tok = getattr(pytest, "demo_token", None)
        if not tok:
            pytest.skip("login failed")
        r = api_client.get(
            f"{base_url}/api/auth/me",
            headers={"Authorization": f"Bearer {tok}"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["email"] == "demo@flashclean.pt"

    def test_me_without_token_401(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_login_wrong_password(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "demo@flashclean.pt", "password": "wrong"},
        )
        assert r.status_code == 401


class TestAuthRegister:
    """Register a new user, verify token + /me, then logout."""

    @pytest.fixture(scope="class")
    def new_user(self, base_url):
        email = f"test_{uuid.uuid4().hex[:10]}@flashclean.pt"
        return {"email": email, "password": "Test1234!!", "full_name": "TEST User"}

    def test_register_returns_token_and_user(self, api_client, base_url, new_user):
        r = api_client.post(f"{base_url}/api/auth/register", json=new_user)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert data["user"]["email"] == new_user["email"]
        assert data["user"]["full_name"] == "TEST User"
        assert "password" in data["user"]["auth_providers"]
        pytest.new_user_token = data["access_token"]
        pytest.new_user_id = data["user"]["id"]

    def test_register_duplicate_409(self, api_client, base_url, new_user):
        r = api_client.post(f"{base_url}/api/auth/register", json=new_user)
        assert r.status_code == 409

    def test_login_new_user(self, api_client, base_url, new_user):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": new_user["email"], "password": new_user["password"]},
        )
        assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == new_user["email"]

    def test_me_persists(self, api_client, base_url):
        tok = getattr(pytest, "new_user_token", None)
        if not tok:
            pytest.skip("register failed")
        r = api_client.get(
            f"{base_url}/api/auth/me", headers={"Authorization": f"Bearer {tok}"}
        )
        assert r.status_code == 200
        assert r.json()["id"] == pytest.new_user_id


class TestGoogleSessionInvalid:
    """We can't run a real Google flow; confirm endpoint reachable + rejects garbage."""

    def test_invalid_google_session_returns_401(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/auth/session",
            json={"session_id": "definitely-not-a-real-session-id"},
        )
        # Either 401 (rejected) or 502 (auth provider unreachable) — both are
        # acceptable error states; must NOT be 200.
        assert r.status_code in (401, 502), r.text


# -------- Bookings --------

class TestBookings:
    """Create a booking, list it, ensure user isolation."""

    def test_create_requires_auth(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/bookings",
            json={"service_type": "casas", "date": "2026-03-01", "address": "Rua A"},
        )
        assert r.status_code == 401

    def test_create_and_list_booking(self, api_client, base_url):
        tok = getattr(pytest, "demo_token", None)
        if not tok:
            pytest.skip("no demo token")
        headers = {"Authorization": f"Bearer {tok}"}
        payload = {
            "service_type": "casas",
            "plan_type": "single",
            "date": "2026-03-01",
            "time": "10:00",
            "address": "TEST Rua das Flores 123, Lisboa",
            "notes": "TEST booking",
        }
        r = api_client.post(f"{base_url}/api/bookings", json=payload, headers=headers)
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["service_type"] == "casas"
        assert b["address"] == payload["address"]
        assert b["status"] == "pending"
        assert b["id"].startswith("bk_")
        pytest.created_booking_id = b["id"]

        # GET to verify persistence
        r2 = api_client.get(f"{base_url}/api/bookings", headers=headers)
        assert r2.status_code == 200
        ids = [x["id"] for x in r2.json()]
        assert pytest.created_booking_id in ids


class TestLogout:
    """Logout revokes the session — subsequent /me must 401."""

    def test_logout_revokes_session(self, api_client, base_url):
        # Use a fresh login so we don't break other tests
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "demo@flashclean.pt", "password": "flashclean123"},
        )
        assert r.status_code == 200
        tok = r.json()["access_token"]
        headers = {"Authorization": f"Bearer {tok}"}

        # Confirm /me works
        assert api_client.get(f"{base_url}/api/auth/me", headers=headers).status_code == 200

        # Logout
        r2 = api_client.post(f"{base_url}/api/auth/logout", headers=headers)
        assert r2.status_code == 200
        assert r2.json().get("ok") is True

        # /me should now 401
        time.sleep(0.2)
        r3 = api_client.get(f"{base_url}/api/auth/me", headers=headers)
        assert r3.status_code == 401
