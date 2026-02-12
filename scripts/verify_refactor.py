import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def create_intervention():
    data = {"name": "Refactor Test Intervention", "objective": "Test Stages"}
    req = urllib.request.Request(f"{BASE_URL}/interventions/", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def create_stage(intervention_id, name, order):
    data = {
        "name": name, 
        "order": order,
        "execution_steps": [
            {"title": "Step 1", "guidance_text": "Do this", "order": 1},
            {"title": "Step 2", "guidance_text": "Do that", "order": 2}
        ]
    }
    req = urllib.request.Request(f"{BASE_URL}/interventions/{intervention_id}/stages", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def start_stage(stage_id, user_id):
    data = {"user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{stage_id}/start", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def add_evidence(stage_id, link, user_id):
    data = {"link": link, "user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{stage_id}/add-link", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def submit_stage(stage_id, user_id):
    data = {"user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{stage_id}/submit", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def review_stage(stage_id, mentor_id, action, feedback=None, rating=None):
    data = {"mentor_id": mentor_id, "action": action, "feedback": feedback, "rating": rating}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{stage_id}/review", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def main():
    try:
        # 1. Create Intervention
        intervention = create_intervention()
        int_id = intervention["id"]
        print(f"Intervention created: {int_id}")

        # 2. Create Stage
        stage = create_stage(int_id, "Discover Stage", 1)
        stage_id = stage["id"]
        print(f"Stage created: {stage_id}")
        assert len(stage["execution_steps"]) == 2

        # 3. Start Stage
        stage = start_stage(stage_id, 1)
        print(f"Stage started: {stage['status']}")
        assert stage["status"] == "in_progress"

        # 4. Try Submit without Evidence -> Fail
        try:
            submit_stage(stage_id, 1)
            print("Error: Allowed submission without evidence")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            if e.code == 400:
                print("Correctly blocked submission without evidence")
            else:
                 raise

        # 5. Add Evidence
        stage = add_evidence(stage_id, "https://drive.google.com/open?id=test", 1)
        print(f"Evidence added: {stage['evidence_links']}")
        assert len(stage['evidence_links']) == 1

        # 6. Submit Stage -> Success
        stage = submit_stage(stage_id, 1)
        print(f"Stage submitted: {stage['status']}")
        assert stage["status"] == "submitted"

        # 7. Review Stage (Approve)
        stage = review_stage(stage_id, 2, "approve", "Great job!", 5)
        print(f"Stage approved: {stage['status']}, Rating: {stage['rating']}")
        assert stage["status"] == "approved"
        assert stage["rating"] == 5
        assert stage["mentor_feedback"] == "Great job!"

        print("Refactor verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        # print body if available
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

if __name__ == "__main__":
    main()
