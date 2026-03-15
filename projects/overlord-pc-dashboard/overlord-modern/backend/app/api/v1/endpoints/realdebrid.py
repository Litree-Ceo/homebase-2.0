"""API endpoints for Real-Debrid integration."""

from fastapi import APIRouter, Depends, HTTPException
from app.config import get_settings, Settings
from app.core.security import verify_api_key
import httpx

router = APIRouter()


@router.post("/add_magnet")
async def add_magnet_link(
    magnet: str,
    settings: Settings = Depends(get_settings),
    api_key: str = Depends(verify_api_key),
):
    """Add a magnet link to Real-Debrid."""
    if not settings.enable_realdebrid or not settings.rd_api_key:
        raise HTTPException(status_code=400, detail="Real-Debrid is not configured.")

    async with httpx.AsyncClient() as client:
        try:
            # 1. Add the magnet
            add_magnet_url = f"https://api.real-debrid.com/rest/1.0/torrents/addMagnet"
            headers = {"Authorization": f"Bearer {settings.rd_api_key}"}
            data = {"magnet": magnet}
            r = await client.post(add_magnet_url, headers=headers, data=data)
            r.raise_for_status()
            magnet_info = r.json()

            # 2. Select all files
            select_files_url = f"https://api.real-debrid.com/rest/1.0/torrents/selectFiles/{magnet_info['id']}"
            await client.post(select_files_url, headers=headers, data={"files": "all"})

            return {"success": True, "message": "Magnet link added successfully."}
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Real-Debrid API error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"An unexpected error occurred: {str(e)}"
            )
