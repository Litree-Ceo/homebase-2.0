#!/usr/bin/env python3
"""Fix admin password with proper bcrypt hash"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from database import async_session
from models import User
from sqlalchemy import select
import bcrypt

async def fix_password():
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.username == "admin")
        )
        user = result.scalar_one_or_none()
        
        if not user:
            print("Admin user not found!")
            return
        
        # Hash password with bcrypt
        password = "admin123"
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        
        user.hashed_password = hashed
        await session.commit()
        print(f"Password updated! Hash: {hashed[:60]}...")

if __name__ == "__main__":
    asyncio.run(fix_password())