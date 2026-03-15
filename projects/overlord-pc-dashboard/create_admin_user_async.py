import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from passlib.context import CryptContext
from main import User  # Assuming User model is in main.py

DATABASE_URL = "sqlite+aiosqlite:///C:/Users/litre/Desktop/Overlord-Pc-Dashboard/overlord.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def create_user():
    async with AsyncSessionLocal() as db:
        try:
            # Check if user already exists
            result = await db.execute(select(User).where(User.email == "admin@overlord.local"))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("User 'admin@overlord.local' already exists.")
                return

            # Create new user
            hashed_password = get_password_hash("password")
            new_user = User(
                email="admin@overlord.local", 
                hashed_password=hashed_password,
                full_name="Admin User",
                is_active=True,
                is_superuser=True
            )
            db.add(new_user)
            await db.commit()
            print("Successfully created user 'admin@overlord.local' with password 'password'")
        finally:
            await db.close()

async def main():
    await create_user()

if __name__ == "__main__":
    asyncio.run(main())
