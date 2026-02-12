import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth

app = FastAPI()

# =========================
# ENV
# =========================

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# =========================
# HEALTH CHECK
# =========================

@app.get("/")
def root():
    return {"status": "HRX Core backend running"}

# =========================
# GOOGLE LOGIN
# =========================

GOOGLE_REDIRECT_URI = "https://hrxcore-868410424369.asia-south1.run.app/auth/google/callback"


@app.get("/auth/google")
async def login_google(request: Request):
    return await oauth.google.authorize_redirect(
        request,
        GOOGLE_REDIRECT_URI
    )


@app.get("/auth/google/callback")
async def auth_google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get("userinfo")

    return JSONResponse({
        "email": user["email"],
        "name": user["name"],
        "picture": user["picture"],
    })
