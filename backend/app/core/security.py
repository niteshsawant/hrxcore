from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-please-change-in-prod")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_google_token(token: str) -> Optional[dict]:
    try:
        # If no client ID configured (e.g. dev/test), we skip strict verification or mock it
        # For production, GOOGLE_CLIENT_ID must be set.
        if not GOOGLE_CLIENT_ID:
            print("WARNING: GOOGLE_CLIENT_ID not set. Skipping verification (DEV ONLY).")
            # In a real scenario, we might want to fail here, but for "mocking" purposes in this flow:
            # We can try to decode it purely as a JWT if it's a test token, or fail.
            # But the user asked to "Validate Google ID token server-side".
            # For strict correctness, we assume the token is real.
            # Since we can't easily get a real token without a browser, 
            # we will return None if verification fails unless we add a mock bypass.
            pass

        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return id_info
    except ValueError as e:
        print(f"Invalid Google Token: {e}")
        return None
