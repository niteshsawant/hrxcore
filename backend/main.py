import os
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from authlib.integrations.starlette_client import OAuth

# =========================
# APP
# =========================

app = FastAPI()

app.add_middleware(HTTPSRedirectMiddleware)

SECRET_KEY = os.environ["SECRET_KEY"]
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]

app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# =========================
# OAUTH
# =========================

oauth = OAuth()

oauth.register(
    name="google",
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

# =========================
# HEALTH
# =========================

@app.get("/")
def root():
    return {"status": "HRX Core backend running"}

# =========================
# AUTH FLOW
# =========================

@app.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token["userinfo"]

    return {
        "email": user["email"],
        "name": user["name"],
        "picture": user["picture"],
    }
