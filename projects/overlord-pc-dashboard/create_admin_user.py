import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from main import User  # Assuming User model is in main.py

DATABASE_URL = "sqlite:///C:/Users/litre/Desktop/Overlord-Pc-Dashboard/overlord.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def create_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.execute(select(User).where(User.email == "admin@overlord.local")).scalar_one_or_none()
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
        db.commit()
        print("Successfully created user 'admin@overlord.local' with password 'password'")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_user())
