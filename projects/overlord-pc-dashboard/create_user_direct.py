#!/usr/bin/env python3
"""Create admin user directly in database - bypasses bcrypt issue"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

import hashlib
from datetime import datetime

from database import async_session
from models import User


async def create_admin():
    from sqlalchemy import select
    
    async with async_session() as session:
        # Check if admin exists
        result = await session.execute(
            select(User).where(User.username == "admin")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Admin user already exists!")
            return
        
        # Create admin user with simple SHA-256 hash (for testing)
        # Note: In production, use proper bcrypt hashing
        admin = User(
            username="admin",
            email="admin@overlord.local",
            hashed_password=hashlib.sha256("admin123".encode()).hexdigest(),
            created_at=datetime.utcnow(),
        )
        session.add(admin)
        await session.commit()
        print("Admin user created! Username: admin, Password: admin123")


if __name__ == "__main__":
    asyncio.run(create_admin())
