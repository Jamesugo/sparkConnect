import requests
import time

BASE_URL = 'http://127.0.0.1:5000'

def test_auth():
    # 1. Test Registration
    email = f"testuser_{int(time.time())}@example.com"
    pwd = "testpassword"
    reg_data = {
        "name": "Test User",
        "email": email,
        "password": pwd,
        "state": "Lagos",
        "specialty": "Residential Electrician"
    }
    
    print(f"Testing registration for {email}...")
    try:
        res = requests.post(f"{BASE_URL}/api/auth/register", json=reg_data)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
        
        if res.status_code == 201:
            print("[OK] Registration successful")
        else:
            print("[FAIL] Registration failed")
            return

        # 2. Test Login
        print("\nTesting login...")
        login_data = {
            "email": email,
            "password": pwd
        }
        res = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
        
        if res.status_code == 200:
            print("[OK] Login successful")
        else:
            print("[FAIL] Login failed")
            
    except requests.exceptions.ConnectionError:
        print("[FAIL] Error: Could not connect to server. Is app.py running?")

if __name__ == "__main__":
    test_auth()
