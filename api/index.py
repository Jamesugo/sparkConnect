import os
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session, send_from_directory
from flask_mail import Mail, Message
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer
import requests
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Try to load .env from public folder for local development
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'public', '.env'))

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'super_secret_key_change_this_later')

# Resolve paths relative to this file
API_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(API_DIR, '..', 'public')

# MongoDB Configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sparkconnect')
client = MongoClient(MONGO_URI)
# Explicitly get the 'sparkconnect' database if the URI doesn't specify one
db = client.get_database('sparkconnect' if 'mongodb+srv' in MONGO_URI else None)

# Configure CORS
CORS(app, supports_credentials=True)

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.secret_key)

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'assets', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    try:
        os.makedirs(UPLOAD_FOLDER)
    except:
        pass # Might fail on read-only serverless environments

def get_db():
    return db

def serialize_doc(doc):
    """Helper to convert MongoDB ObjectId to string id"""
    if doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

def init_db():
    """Seed data if collections are empty"""
    try:
        users_col = db.users
        if users_col.count_documents({}) == 0:
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
            print("Seeded database with default users.")
    except Exception as e:
        print(f"Init DB error: {e}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password')
    name = data.get('name')
    specialty = data.get('specialty')
    role = data.get('role')

    if not specialty and role:
        specialty = role

    state = data.get('state')
    location = data.get('location', state + ", Nigeria" if state else "Nigeria")
    description = data.get('description', "Hi, I am a new member on Sparkconnect.")
    image = data.get('image', "assets/images/profile_placeholder.jpg")
    rating = data.get('rating', 0)
    reviews = data.get('reviews', 0)
    
    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400
    
    users_col = db.users
    if users_col.find_one({'email': email}):
        return jsonify({'error': 'Email already exists'}), 409
        
    try:
        new_user = {
            'email': email,
            'password': generate_password_hash(password),
            'name': name,
            'specialty': specialty,
            'state': state,
            'location': location,
            'description': description,
            'image': image,
            'rating': rating,
            'reviews': reviews,
            'gallery': [],
            'reviews_data': []
        }
        users_col.insert_one(new_user)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password')
    
    try:
        users_col = db.users
        user = users_col.find_one({'$or': [{'email': email}, {'name': email}]})
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = str(user['_id'])
            return jsonify({
                'message': 'Logged in',
                'user': {
                    'id': str(user['_id']),
                    'name': user['name'],
                    'email': user['email'],
                    'specialty': user.get('specialty'),
                    'image': user.get('image')
                }
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': f"Database connection error: {str(e)}"}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify(None), 200
    
    try:
        user = db.users.find_one({'_id': ObjectId(session['user_id'])})
        if user:
            return jsonify(serialize_doc(user))
    except:
        pass
    return jsonify(None), 200

@app.route('/api/user/update', methods=['PUT'])
def update_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    fields = ['name', 'specialty', 'location', 'state', 'phone', 'whatsapp', 'description', 'image', 'email']
    updates = {}
    
    for field in fields:
        if field in data:
            updates[field] = data[field]
            
    if updates:
        db.users.update_one({'_id': ObjectId(session['user_id'])}, {'$set': updates})
    
    return jsonify({'message': 'Profile updated'})

@app.route('/api/electricians', methods=['GET'])
def get_electricians():
    users = db.users.find({'specialty': {'$nin': ['Visitor', 'Administrator']}})
    result = []
    for u in users:
        result.append(serialize_doc(u))
    return jsonify(result)

@app.route('/api/electricians/<string:id>/review', methods=['POST'])
def add_review(id):
    data = request.json
    rating = data.get('rating')
    name = data.get('name')
    comment = data.get('comment')
    
    if not rating or not name:
        return jsonify({'error': 'Missing rating or name'}), 400
        
    try:
        user = db.users.find_one({'_id': ObjectId(id)})
        if not user:
            return jsonify({'error': 'Electrician not found'}), 404
            
        new_review = {
            'rating': rating,
            'name': name,
            'comment': comment,
            'date': data.get('date') or datetime.now().isoformat()
        }
        
        reviews_list = user.get('reviews_data', [])
        reviews_list.append(new_review)
        
        total_rating = sum(r['rating'] for r in reviews_list)
        new_avg = round(total_rating / len(reviews_list), 1)
        new_count = len(reviews_list)
        
        db.users.update_one(
            {'_id': ObjectId(id)},
            {'$set': {
                'reviews_data': reviews_list,
                'rating': new_avg,
                'reviews': new_count
            }}
        )
        
        return jsonify({'message': 'Review added', 'rating': new_avg, 'reviews': new_count})
    except:
        return jsonify({'error': 'Invalid ID'}), 400

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        import time
        filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return jsonify({'url': f"assets/uploads/{filename}"})
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/user/gallery', methods=['POST'])
def add_to_gallery():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    new_item = data.get('url')
    if not new_item:
        return jsonify({'error': 'Missing url'}), 400
    if isinstance(new_item, list):
        db.users.update_one({'_id': ObjectId(session['user_id'])}, {'$push': {'gallery': {'$each': new_item}}})
    else:
        db.users.update_one({'_id': ObjectId(session['user_id'])}, {'$push': {'gallery': new_item}})
    user = db.users.find_one({'_id': ObjectId(session['user_id'])})
    return jsonify({'gallery': user.get('gallery', [])})

@app.route('/api/user/gallery', methods=['DELETE'])
def remove_from_gallery():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    item_to_remove = data.get('url')
    db.users.update_one({'_id': ObjectId(session['user_id'])}, {'$pull': {'gallery': item_to_remove}})
    user = db.users.find_one({'_id': ObjectId(session['user_id'])})
    return jsonify({'gallery': user.get('gallery', [])})

@app.route('/api/admin/users/<string:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    current_user = db.users.find_one({'_id': ObjectId(session['user_id'])})
    if not current_user or current_user['email'] != 'admin@sparkconnect.com':
        return jsonify({'error': 'Admin access required'}), 403
    if user_id == session['user_id']:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    try:
        db.users.delete_one({'_id': ObjectId(user_id)})
        return jsonify({'message': 'User deleted successfully'})
    except:
        return jsonify({'error': 'Invalid ID'}), 400

# Local testing execution block
if __name__ == '__main__':
    init_db()
    
    # In local testing, index.py can serve static files
    @app.route('/')
    def serve_index():
        return send_from_directory(BASE_DIR, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        full_path = os.path.join(BASE_DIR, path)
        if os.path.exists(full_path):
            return send_from_directory(BASE_DIR, path)
        return send_from_directory(BASE_DIR, 'index.html')

    app.run(debug=True, host='0.0.0.0', port=5000)
