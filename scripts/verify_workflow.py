import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def create_intervention():
    data = {"name": "Test Intervention", "objective": "Optimize stuff"}
    req = urllib.request.Request(f"{BASE_URL}/interventions/", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def create_phase(intervention_id, name, order):
    data = {"name": name, "order": order}
    req = urllib.request.Request(f"{BASE_URL}/interventions/{intervention_id}/phases", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def start_phase(phase_id, user_id):
    data = {"user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{phase_id}/start", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Start Phase Failed: {e.code} - {e.read().decode('utf-8')}")
        raise

def submit_phase(phase_id, user_id):
    data = {"user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{phase_id}/submit", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def review_phase(phase_id, mentor_id, action, feedback=None):
    data = {"mentor_id": mentor_id, "action": action, "feedback": feedback}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{phase_id}/review", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def main():
    try:
        # 1. Create Intervention
        intervention = create_intervention()
        int_id = intervention["id"]
        print(f"Intervention created: {int_id}")

        # 2. Create Phases
        p1 = create_phase(int_id, "Define", 1)
        p2 = create_phase(int_id, "Measure", 2)
        print(f"Phases created: {p1['id']}, {p2['id']}")

        # 3. Try to start Phase 2 (Should Fail - Locked and Prev not Approved)
        try:
            start_phase(p2["id"], 1)
        except urllib.error.HTTPError as e:
            if e.code == 400:
                print("Correctly prevented starting Phase 2")
            else:
                 print(f"Unexpected error starting Phase 2: {e.code}")

        # 4. Start Phase 1
        p1 = start_phase(p1["id"], 1)
        print(f"Phase 1 started: {p1['status']}")
        assert p1["status"] == "in_progress"

        # 5. Submit Phase 1
        p1 = submit_phase(p1["id"], 1)
        print(f"Phase 1 submitted: {p1['status']}")
        assert p1["status"] == "submitted"

        # 6. Review Phase 1 (Approve)
        p1 = review_phase(p1["id"], 2, "approve")
        print(f"Phase 1 approved: {p1['status']}")
        assert p1["status"] == "approved"

        # 7. Start Phase 2 (Now allowed)
        p2 = start_phase(p2["id"], 1)
        print(f"Phase 2 started: {p2['status']}")
        assert p2["status"] == "in_progress"
        
        print("Workflow verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
