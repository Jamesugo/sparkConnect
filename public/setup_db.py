from app import init_db
import os

if os.path.exists("sparkconnect.db"):
    os.remove("sparkconnect.db")
    print("Deleted old DB")

init_db()
print("Initialized new DB")
