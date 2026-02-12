import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_health():
    try:
        # Check root health
        with urllib.request.urlopen("http://127.0.0.1:8000/health") as response:
            if response.status == 200:
                print("Health check OK")
            else:
                print(f"Health check failed: {response.status}")
                sys.exit(1)
    except Exception as e:
        print(f"Health check exception: {e}")
        sys.exit(1)

def test_users():
    try:
        # Create user
        user_data = {"name": "Test User", "email": "test_simple@example.com", "role": "admin"}
        data = json.dumps(user_data).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/users/", data=data, headers={'Content-Type': 'application/json'})
        
        try:
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    print("Create user OK")
                    resp_data = json.loads(response.read().decode('utf-8'))
                    user_id = resp_data["id"]
                    # Get user
                    with urllib.request.urlopen(f"{BASE_URL}/users/{user_id}") as response_get:
                         if response_get.status == 200:
                             print("Get user OK")
                         else:
                             print(f"Get user failed: {response_get.status}")
        except urllib.error.HTTPError as e:
            if e.code == 400:
                 print("User already exists (or other 400 error)")
            else:
                print(f"Create user failed with HTTPError: {e.code}")
                sys.exit(1)
                
    except Exception as e:
        print(f"User test exception: {e}")
        sys.exit(1)

def main():
    test_health()
    test_users()

if __name__ == "__main__":
    main()
