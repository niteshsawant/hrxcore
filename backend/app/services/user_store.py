from uuid import uuid4
from datetime import datetime

USERS = {}

def create_user(data: dict):
    user_id = uuid4()
    user = {
        "id": user_id,
        "email": data["email"],
        "full_name": data["full_name"],
        "org_id": data["org_id"],
        "created_at": datetime.utcnow()
    }
    USERS[user_id] = user
    return user

def list_users(org_id=None):
    if org_id:
        return [u for u in USERS.values() if u["org_id"] == org_id]
    return list(USERS.values())
