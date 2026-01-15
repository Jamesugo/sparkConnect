import urllib.request
import urllib.parse
import http.cookiejar
import json
import sys

BASE_URL = 'http://127.0.0.1:5000'

def verify_session():
    print("Testing Session Persistence (urllib)...")
    
    # Setup cookie jar
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    
    # 1. Login
    login_url = f"{BASE_URL}/api/auth/login"
    login_data = json.dumps({
        "email": "sarah@example.com",
        "password": "password"
    }).encode('utf-8')
    
    req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})
    
    try:
        print(f"Logging in to {BASE_URL}...")
        with opener.open(req) as response:
            if response.status != 200:
                print(f"Login failed: {response.status}")
                sys.exit(1)
            print("Login successful")
            print(f"Cookies: {[c.name for c in cj]}")
            
        # 2. Check /me
        me_url = f"{BASE_URL}/api/auth/me"
        print("Checking /api/auth/me with persisted session...")
        
        with opener.open(me_url) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                if data and data.get('email') == 'sarah@example.com':
                    print(f"Session verified! User: {data['name']}")
                else:
                    print(f"Session invalid: User data mismatch. Data: {data}")
                    sys.exit(1)
            else:
                print(f"❌ Session check failed: {response.status}")
                sys.exit(1)
                
    except urllib.error.URLError as e:
        print(f"❌ Connection error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_session()
