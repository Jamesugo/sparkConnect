import os
from pymongo import MongoClient
from dotenv import load_dotenv

def check_user():
    load_dotenv('public/.env')
    uri = os.environ.get('MONGO_URI')
    client = MongoClient(uri)
    db = client.get_database('sparkconnect')
    user = db.users.find_one({'email': 'testvisitor@gmail.com'})
    if user:
        print(f"User found: {user['name']}")
        print(f"Role/Specialty: {user.get('specialty')}")
    else:
        print("User not found")

if __name__ == "__main__":
    check_user()
