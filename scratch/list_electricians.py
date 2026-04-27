import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('public/.env')
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sparkconnect')
client = MongoClient(MONGO_URI)
db = client.get_database('sparkconnect' if 'mongodb+srv' in MONGO_URI else None)

users = db.users.find({'specialty': {'$nin': ['Visitor', 'Administrator']}})
for u in users:
    print(f"ID: {u['_id']}, Name: {u['name']}, Specialty: {u.get('specialty')}")
