import sqlite3
import json
import sys

def inspect_users():
    try:
        conn = sqlite3.connect('sparkconnect.db')
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        
        # Check columns
        print("Checking table 'users' schema:")
        cols = cur.execute('PRAGMA table_info(users)').fetchall()
        column_names = [c['name'] for c in cols]
        for c in cols:
            print(f"- {c['name']} ({c['type']})")
            
        print(f"\nTotal columns: {len(cols)}")
        
        # Verify critical columns for signup exist
        required = ['email', 'password', 'name', 'specialty', 'state', 'location', 
                   'description', 'image', 'rating', 'reviews', 'gallery', 'reviews_data']
        
        missing = [req for req in required if req not in column_names]
        
        if missing:
            print(f"\n❌ CRITICAL: Missing columns: {missing}")
            print("To fix: delete 'sparkconnect.db' and restart app.py to recreate it.")
        else:
            print("\n✅ All required columns specific to signup appear to be present.")

        conn.close()
    except Exception as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    inspect_users()
