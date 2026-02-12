import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def get_guidance(step_id, user_id):
    try:
        url = f"{BASE_URL}/execution-steps/{step_id}/ai-guidance?user_id={user_id}"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Guidance Error: {e.read().decode('utf-8')}")
        raise

def get_feedback(step_id, notes, user_id):
    try:
        url = f"{BASE_URL}/execution-steps/{step_id}/ai-feedback"
        data = {"user_id": user_id, "notes": notes}
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method="POST")
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Feedback Error: {e.read().decode('utf-8')}")
        raise

def main():
    # Assuming step_id 1 exists from previous tests (Discover Stage -> Step 1)
    step_id = 1
    user_id = 1

    print("--- Testing AI Guidance ---")
    try:
        guidance = get_guidance(step_id, user_id)
        print("Guidance Response:", guidance)
    except Exception as e:
        print(f"Guidance Test Failed: {e}")

    print("\n--- Testing AI Feedback ---")
    try:
        feedback = get_feedback(step_id, "I have identified the problem but need more data.", user_id)
        print("Feedback Response:", feedback)
    except Exception as e:
        print(f"Feedback Test Failed: {e}")

if __name__ == "__main__":
    main()
