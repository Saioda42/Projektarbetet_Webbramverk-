from passlib.context import CryptContext
from app.database import SessionLocal
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

hashed_password = pwd_context.hash("password123")

user = User(
    email="test@test.com",
    hashed_password=hashed_password
)

db.add(user)
db.commit()
db.close()

print("Test user created!")