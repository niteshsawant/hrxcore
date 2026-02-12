import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/health") # legacy health check is at /health, but let's check /api/v1/health or whatever is mounted
        # Wait, legacy health check in main.py is at /health
        # router.py mounts at /api/v1
        # router.py includes health_router
        # Let's check root health first
        response = requests.get("http://127.0.0.1:8000/health")
        if response.status_code == 200:
            print("Health check OK")
        else:
            print(f"Health check failed: {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"Health check exception: {e}")
        sys.exit(1)

def test_users():
    # Create user
    user_data = {"name": "Test User", "email": "test@example.com", "role": "admin"}
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    if response.status_code == 200:
        print("Create user OK")
        user_id = response.json()["id"]
        # Get user
        response = requests.get(f"{BASE_URL}/users/{user_id}")
        if response.status_code == 200:
            print("Get user OK")
        else:
            print(f"Get user failed: {response.status_code}")
    elif response.status_code == 400 and "Email already registered" in response.text:
        print("User already exists (expected on re-run)")
    else:
        print(f"Create user failed: {response.status_code} - {response.text}")

def main():
    test_health()
    test_users()

if __name__ == "__main__":
    main()
