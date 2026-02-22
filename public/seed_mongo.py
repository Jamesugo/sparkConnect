import os
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

# MongoDB Configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sparkconnect')
client = MongoClient(MONGO_URI)
db = client.get_database()

def seed_db():
    users_col = db.users
    # Clear existing if needed or just skip
    if users_col.count_documents({}) > 0:
        print("Database already has data. Skipping seed.")
        return

    defaults = [
         {
            "name": "Sarah Johnson", "specialty": "Residential Wiring", "rating": 4.8, "reviews": 120,
            "location": "Lagos", "state": "Lagos", "image": "assets/images/profile1.jpg", 
            "description": "Expert in residential wiring and lighting installations.", "email": "sarah@example.com",
            "password": generate_password_hash("password"), "gallery": [], "reviews_data": []
        },
        {
            "name": "Michael Chen", "specialty": "Commercial Systems", "rating": 4.9, "reviews": 150,
            "location": "Abuja", "state": "FCT - Abuja", "image": "assets/images/profile2.jpg",
            "description": "Specializes in commercial electrical systems.", "email": "michael@example.com",
            "password": generate_password_hash("password"), "gallery": [], "reviews_data": []
        },
        {
            "name": "Admin", "specialty": "Administrator", "rating": 0, "reviews": 0,
            "location": "Nigeria", "state": "FCT - Abuja", "image": "assets/images/profile_placeholder.jpg",
            "description": "SparkConnect Administrator", "email": "admin@sparkconnect.com",
            "password": generate_password_hash("admin123"), "gallery": [], "reviews_data": []
        }
    ]
    users_col.insert_many(defaults)
    print("Successfully seeded MongoDB with default users.")

if __name__ == "__main__":
    seed_db()
