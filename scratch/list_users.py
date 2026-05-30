import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('public/.env')
uri = os.environ.get('MONGO_URI')
client = MongoClient(uri)
db = client.get_database('sparkconnect')

print("Database 'sparkconnect' Users:")
for u in db.users.find():
    print(f"- Name: {u.get('name')}, Email: {u.get('email')}, Role/Specialty: {u.get('specialty')}")
