import os
import pytest
import requests

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/") if os.environ.get("EXPO_PUBLIC_BACKEND_URL") else "http://localhost:8001"


@pytest.fixture(scope="session")
def base_url():
    # Use public URL from frontend/.env when available
    from pathlib import Path
    env_file = Path("/app/frontend/.env")
    url = None
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("EXPO_PUBLIC_BACKEND_URL="):
                url = line.split("=", 1)[1].strip().strip('"')
                break
    if not url:
        url = "http://localhost:8001"
    return url.rstrip("/")


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s
