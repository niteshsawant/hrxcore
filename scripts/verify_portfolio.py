import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def create_intervention(user_id, name, cost, prod):
    data = {
        "name": name,
        "assigned_practitioner_id": user_id,
        "cost_saved": cost,
        "productivity_gain": prod,
        "status": "completed" # Directly creating as completed for testing aggregation
    }
    req = urllib.request.Request(f"{BASE_URL}/interventions/", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def get_my_portfolio(user_id):
    url = f"{BASE_URL}/portfolio/master/my-portfolio?practitioner_id={user_id}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def get_public_profile(slug):
    url = f"{BASE_URL}/profile/{slug}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode('utf-8'))

def main():
    try:
        user_id = 1 # Assuming user 1 exists
        
        # 1. Create interventions with metrics
        print("Creating interventions...")
        i1 = create_intervention(user_id, "Cost Saving Project", 5000.0, 10.0)
        print(f"Created: {i1['name']} (${i1.get('cost_saved', 0)})")
        
        i2 = create_intervention(user_id, "Productivity Project", 1000.0, 50.0)
        print(f"Created: {i2['name']} (${i2.get('cost_saved', 0)})")

        # 2. Trigger Portfolio Update
        print("\nUpdating Portfolio...")
        portfolio = get_my_portfolio(user_id)
        slug = portfolio['public_slug']
        print(f"Portfolio Updated. Slug: {slug}")
        print(f"Total Cost Saved: ${portfolio['total_cost_saved']}")
        print(f"Total Productivity: {portfolio['total_productivity_gain']}")

        # Verify Aggregation (Note: existing interventions might affect totals, so just checking it's >= what we added)
        assert portfolio['total_cost_saved'] >= 6000.0
        assert portfolio['total_productivity_gain'] >= 60.0

        # 3. Check Public Profile
        print(f"\nChecking Public Profile: {slug}")
        profile = get_public_profile(slug)
        print("Profile loaded successfully.")
        print(f"Practitioner: {profile['practitioner_name']}")
        print(f"Interventions count: {profile['total_interventions']}")
        
        assert profile['public_slug'] == slug
        assert profile['total_cost_saved'] == portfolio['total_cost_saved']

        print("\nMaster Portfolio Verification Successful!")

    except Exception as e:
        print(f"Verification Failed: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

if __name__ == "__main__":
    main()
