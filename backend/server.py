"""FlashClean backend - minimal companion service.

Auth, services, bookings, profiles and realtime live on the shared
Supabase project. This backend exists only for privileged server-side
work (jobs that legitimately need the service role key).
"""

from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

app = FastAPI(title="FlashClean Companion API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {
        "service": "FlashClean Companion API",
        "ok": True,
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
        "notes": "Auth, catalog and bookings live on Supabase. Service role key is server-side only.",
    }


@api_router.get("/health")
async def health():
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("flashclean")
