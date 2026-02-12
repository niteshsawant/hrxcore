import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def create_intervention():
    data = {"name": "Test Intervention Evidence", "objective": "Test Evidence"}
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
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def create_submission(phase_id, practitioner_id):
    data = {"phase_id": phase_id, "practitioner_id": practitioner_id}
    req = urllib.request.Request(f"{BASE_URL}/submissions", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def add_link(submission_id, link):
    data = {"link": link}
    req = urllib.request.Request(f"{BASE_URL}/submissions/{submission_id}/add-link", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def submit_phase(phase_id, user_id):
    data = {"user_id": user_id}
    req = urllib.request.Request(f"{BASE_URL}/workflow/{phase_id}/submit", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def main():
    try:
        # 1. Setup
        intervention = create_intervention()
        phase = create_phase(intervention["id"], "Evidence Phase", 1)
        start_phase(phase["id"], 1)
        
        # 2. Create Submission (empty evidence)
        submission = create_submission(phase["id"], 1)
        print(f"Submission created: {submission['id']}")
        
        # 3. Try submit Phase -> Should Fail
        try:
            submit_phase(phase["id"], 1)
            print("Error: Allowed submission without evidence")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            if e.code == 400:
                print("Correctly blocked submission without evidence")
            else:
                print(f"Unexpected error: {e.code}")
                sys.exit(1)

        # 4. Try add invalid link -> Should Fail
        try:
            add_link(submission["id"], "http://example.com")
            print("Error: Allowed non-Drive link")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            if e.code == 400:
                print("Correctly blocked non-Drive link")

        # 5. Add valid link -> Should Succeed
        valid_link = "https://drive.google.com/file/d/12345"
        submission = add_link(submission["id"], valid_link)
        print(f"Link added: {submission['evidence_links']}")
        assert valid_link in submission["evidence_links"]

        # 6. Submit Phase -> Should Succeed
        phase = submit_phase(phase["id"], 1)
        print(f"Phase submitted: {phase['status']}")
        assert phase["status"] == "submitted"

        print("Evidence System verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
