"""FlashClean backend - FastAPI + MongoDB.

Provides:
- JWT email/password auth
- Emergent Google Auth session ingestion
- Booking CRUD
"""

from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Optional

import httpx
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -------------------------------------------------------------------------
# Config
# -------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "flashclean-dev-secret-change-me-in-prod")
JWT_ALGO = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 7  # 7 days
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
DUMMY_HASH = pwd_ctx.hash("dummy-password-placeholder")

# -------------------------------------------------------------------------
# DB
# -------------------------------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="FlashClean API")
api_router = APIRouter(prefix="/api")


# -------------------------------------------------------------------------
# Models
# -------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    full_name: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    picture: Optional[str] = None
    auth_providers: list[str] = []


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleSessionIn(BaseModel):
    session_id: str


class BookingIn(BaseModel):
    service_type: str
    plan_type: Optional[str] = None  # "single" | "weekly" | "biweekly" | "monthly"
    date: str  # ISO date string
    time: Optional[str] = None
    address: str
    notes: Optional[str] = None


class BookingOut(BaseModel):
    id: str
    user_id: str
    service_type: str
    plan_type: Optional[str] = None
    date: str
    time: Optional[str] = None
    address: str
    notes: Optional[str] = None
    status: str
    created_at: str


# -------------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return pwd_ctx.verify(pw, hashed)
    except Exception:
        return False


def create_access_token(user_id: str, jti: str) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO), exp


def user_to_out(doc: dict) -> UserOut:
    return UserOut(
        id=doc["user_id"],
        email=doc["email"],
        full_name=doc.get("full_name"),
        picture=doc.get("picture"),
        auth_providers=doc.get("auth_providers", []),
    )


async def get_current_user(authorization: Annotated[Optional[str], Header()] = None) -> dict:
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise cred_exc
    token = authorization.split(" ", 1)[1].strip()

    # Try JWT (password login) first
    user_doc = None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user_id = payload.get("sub")
        jti = payload.get("jti")
        if user_id and jti:
            session = await db.user_sessions.find_one(
                {"jti": jti, "revoked": {"$ne": True}}, {"_id": 0}
            )
            if session:
                exp_at = session.get("expires_at")
                if exp_at and exp_at.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
                    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    except jwt.InvalidTokenError:
        pass

    # Fall back to Emergent session token
    if not user_doc:
        session = await db.user_sessions.find_one(
            {"session_token": token, "revoked": {"$ne": True}}, {"_id": 0}
        )
        if session:
            exp_at = session.get("expires_at")
            if exp_at and exp_at.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
                user_doc = await db.users.find_one(
                    {"user_id": session["user_id"]}, {"_id": 0}
                )

    if not user_doc:
        raise cred_exc
    return user_doc


# -------------------------------------------------------------------------
# Auth routes
# -------------------------------------------------------------------------
@api_router.post("/auth/register", response_model=TokenOut)
async def register(payload: RegisterIn):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(409, "Email already registered")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "full_name": payload.full_name,
        "picture": None,
        # google_sub intentionally omitted so the sparse unique index ignores it
        "auth_providers": ["password"],
        "created_at": now,
        "updated_at": now,
    }
    await db.users.insert_one(doc)

    jti = uuid.uuid4().hex
    token, exp = create_access_token(user_id, jti)
    await db.user_sessions.insert_one(
        {
            "jti": jti,
            "user_id": user_id,
            "provider": "password",
            "created_at": now,
            "expires_at": exp,
            "revoked": False,
        }
    )
    return TokenOut(access_token=token, user=user_to_out(doc))


@api_router.post("/auth/login", response_model=TokenOut)
async def login(payload: LoginIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not user.get("password_hash"):
        verify_password(payload.password, DUMMY_HASH)  # timing
        raise HTTPException(401, "Invalid email or password")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    jti = uuid.uuid4().hex
    token, exp = create_access_token(user["user_id"], jti)
    await db.user_sessions.insert_one(
        {
            "jti": jti,
            "user_id": user["user_id"],
            "provider": "password",
            "created_at": datetime.now(timezone.utc),
            "expires_at": exp,
            "revoked": False,
        }
    )
    return TokenOut(access_token=token, user=user_to_out(user))


@api_router.post("/auth/session", response_model=TokenOut)
async def google_session(payload: GoogleSessionIn):
    """Exchange Emergent session_id for our session_token + user."""
    headers = {"X-Session-ID": payload.session_id}
    try:
        async with httpx.AsyncClient(timeout=15.0) as http:
            resp = await http.get(EMERGENT_SESSION_URL, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(401, "Invalid Google session")
            data = resp.json()
    except httpx.HTTPError:
        raise HTTPException(502, "Auth provider unreachable")

    email = data.get("email", "").lower().strip()
    if not email:
        raise HTTPException(400, "Google profile missing email")

    google_sub = data.get("id")
    name = data.get("name")
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not session_token:
        raise HTTPException(502, "Auth provider missing session_token")

    now = datetime.now(timezone.utc)
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        update = {
            "google_sub": google_sub,
            "picture": picture or existing.get("picture"),
            "full_name": existing.get("full_name") or name,
            "updated_at": now,
        }
        providers = set(existing.get("auth_providers", []))
        providers.add("google")
        update["auth_providers"] = list(providers)
        await db.users.update_one({"user_id": user_id}, {"$set": update})
        user_doc = {**existing, **update}
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "password_hash": None,
            "full_name": name,
            "picture": picture,
            "google_sub": google_sub,
            "auth_providers": ["google"],
            "created_at": now,
            "updated_at": now,
        }
        await db.users.insert_one(user_doc)

    exp = now + timedelta(days=7)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {
            "$set": {
                "session_token": session_token,
                "user_id": user_id,
                "provider": "google",
                "created_at": now,
                "expires_at": exp,
                "revoked": False,
            }
        },
        upsert=True,
    )
    return TokenOut(access_token=session_token, user=user_to_out(user_doc))


@api_router.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    return user_to_out(current)


@api_router.post("/auth/logout")
async def logout(
    authorization: Annotated[Optional[str], Header()] = None,
    current=Depends(get_current_user),
):
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        # Revoke jwt-jti based session if applicable
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
            if payload.get("jti"):
                await db.user_sessions.update_one(
                    {"jti": payload["jti"]}, {"$set": {"revoked": True}}
                )
        except jwt.InvalidTokenError:
            pass
        # Also try session_token
        await db.user_sessions.update_one(
            {"session_token": token}, {"$set": {"revoked": True}}
        )
    return {"ok": True}


# -------------------------------------------------------------------------
# Bookings
# -------------------------------------------------------------------------
@api_router.post("/bookings", response_model=BookingOut)
async def create_booking(payload: BookingIn, current=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    booking_id = f"bk_{uuid.uuid4().hex[:12]}"
    doc = {
        "booking_id": booking_id,
        "user_id": current["user_id"],
        "service_type": payload.service_type,
        "plan_type": payload.plan_type,
        "date": payload.date,
        "time": payload.time,
        "address": payload.address,
        "notes": payload.notes,
        "status": "pending",
        "created_at": now.isoformat(),
    }
    await db.bookings.insert_one(doc.copy())
    return BookingOut(
        id=booking_id,
        user_id=current["user_id"],
        service_type=payload.service_type,
        plan_type=payload.plan_type,
        date=payload.date,
        time=payload.time,
        address=payload.address,
        notes=payload.notes,
        status="pending",
        created_at=doc["created_at"],
    )


@api_router.get("/bookings", response_model=list[BookingOut])
async def list_bookings(current=Depends(get_current_user)):
    cursor = db.bookings.find({"user_id": current["user_id"]}, {"_id": 0}).sort("created_at", -1)
    items = await cursor.to_list(length=200)
    return [
        BookingOut(
            id=b["booking_id"],
            user_id=b["user_id"],
            service_type=b["service_type"],
            plan_type=b.get("plan_type"),
            date=b["date"],
            time=b.get("time"),
            address=b["address"],
            notes=b.get("notes"),
            status=b.get("status", "pending"),
            created_at=b["created_at"],
        )
        for b in items
    ]


# -------------------------------------------------------------------------
# Health
# -------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"service": "FlashClean API", "ok": True}


# -------------------------------------------------------------------------
# Startup
# -------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.users.create_index("google_sub", unique=True, sparse=True)
    await db.user_sessions.create_index("jti", unique=True, sparse=True)
    await db.user_sessions.create_index("session_token", unique=True, sparse=True)
    await db.user_sessions.create_index("user_id")
    await db.bookings.create_index("user_id")
    await db.bookings.create_index("booking_id", unique=True)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


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
