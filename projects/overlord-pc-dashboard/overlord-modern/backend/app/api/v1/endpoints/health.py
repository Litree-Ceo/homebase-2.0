from fastapi import APIRouter
from pydantic import BaseModel
import datetime

router = APIRouter()

class HealthCheck(BaseModel):
    status: str
    mode: str
    reality_check: str
    working: list[str]
    fake_until_proven: list[str]
    timestamp: str
    message: str

@router.get("/", response_model=HealthCheck, tags=["Health"])
def get_health():
    return {
        "status": "online",
        "mode": "alpha-no-bullshit",
        "reality_check": "20% shipped, 80% openly in progress",
        "working": ["PWA icons", "GRID dashboard shell", "Firebase hosting", "chat stub", "diagnostics stub"],
        "fake_until_proven": ["agents", "btc bot", "supabase sync", "stripe real", "3d metaverse"],
        "timestamp": datetime.datetime.now().isoformat(),
        "message": "This used to be vaporware. Now it's just early."
    }
