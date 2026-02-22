import os
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session, send_from_directory
from flask_mail import Mail, Message
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__, static_folder='.')
app.secret_key = 'super_secret_key_change_this_later'
GOOGLE_CLIENT_ID = "1033822674322-4e9qr40dt8092qjvqqh0n16sjup4tbek.apps.googleusercontent.com"

# MongoDB Configuration
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sparkconnect')
client = MongoClient(MONGO_URI)
db = client.get_database()

# Configure CORS
# Allow localhost (standard ports) and the Vercel production URL
CORS(app, supports_credentials=True)

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.secret_key)

UPLOAD_FOLDER = 'assets/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

# --- API ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password')
    name = data.get('name')
    specialty = data.get('specialty')
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
    
    users_col = db.users
    # Support email or name login
    user = users_col.find_one({'$or': [{'email': email}, {'name': email}]})
    
    if user and check_password_hash(user['password'], password):
        session['user_id'] = str(user['_id'])
        return jsonify({
            'message': 'Logged in',
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email']
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.json
    token = data.get('credential')
    
    if not token:
        return jsonify({'error': 'Missing credential'}), 400
        
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')

        email = idinfo['email']
        print(f"DEBUG: Google Auth success for {email}")
        
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture', "assets/images/profile_placeholder.jpg")
        
        users_col = db.users
        user = users_col.find_one({'email': email.lower()})
        
        if not user:
            # Create new user
            new_user = {
                'email': email.lower(),
                'password': generate_password_hash(token[-20:]),
                'name': name,
                'specialty': "Visitor",
                'state': "Lagos",
                'location': "Lagos, Nigeria",
                'description': "Hi, I joined via Google.",
                'image': picture,
                'rating': 0,
                'reviews': 0,
                'gallery': [],
                'reviews_data': []
            }
            result = users_col.insert_one(new_user)
            user = users_col.find_one({'_id': result.inserted_id})
            is_new = True
        else:
            is_new = False
            
        session['user_id'] = str(user['_id'])
        return jsonify({
            'message': 'Logged in via Google',
            'is_new': is_new,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email']
            }
        })
    except Exception as e:
        print(f"DEBUG: Google Auth Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

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
    # Whitelist fields to update
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
        
        # Recalculate
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
        # Unique name
        import time
        filename = f"{int(time.time())}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Return the web path
        return jsonify({'url': f"assets/uploads/{filename}"})
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/api/user/gallery', methods=['POST'])
def add_to_gallery():
    """Add an item to the user's gallery list (after upload)"""
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
    """Admin endpoint to delete a user account"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Check if current user is admin
    current_user = db.users.find_one({'_id': ObjectId(session['user_id'])})
    
    if not current_user or current_user['email'] != 'admin@sparkconnect.com':
        return jsonify({'error': 'Admin access required'}), 403
    
    # Don't allow admin to delete themselves
    if user_id == session['user_id']:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    # Delete the user
    try:
        db.users.delete_one({'_id': ObjectId(user_id)})
        return jsonify({'message': 'User deleted successfully'})
    except:
        return jsonify({'error': 'Invalid ID'}), 400


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    data = request.json
    email = data.get('email', '').lower()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    user = db.users.find_one({'email': email})
    
    if not user:
        # Don't reveal if email exists or not
        return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200
    
    # Generate reset token
    token = serializer.dumps(user['email'], salt='password-reset-salt')
    expiry = datetime.now() + timedelta(hours=1)
    
    # Save token to database
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'reset_token': token,
            'reset_token_expiry': expiry
        }}
    )
    
    # Send email
    try:
        base_url = request.host_url.rstrip('/')
        reset_url = f"{base_url}/reset-password.html?token={token}"
        msg = Message(
            'Password Reset Request - SparkConnect',
            recipients=[user['email']]
        )
        msg.body = f"Hello {user['name']},\n\nClick here to reset your password: {reset_url}"
        mail.send(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.json
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
    
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
    except:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    user = db.users.find_one({'email': email.lower(), 'reset_token': token})
    
    if not user:
        return jsonify({'error': 'Invalid reset token'}), 400
    
    # Check if token expired
    if user.get('reset_token_expiry'):
        if datetime.now() > user['reset_token_expiry']:
            return jsonify({'error': 'Reset token has expired'}), 400
    
    # Update password and clear reset token
    hashed_password = generate_password_hash(new_password)
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'password': hashed_password,
            'reset_token': None,
            'reset_token_expiry': None
        }}
    )
    
    return jsonify({'message': 'Password reset successfully'}), 200


if __name__ == '__main__':
    init_db()
    
    # Move static routes here to ensure they don't override API routes
    @app.route('/')
    def serve_index():
        return send_from_directory('.', 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(path):
            return send_from_directory('.', path)
        return send_from_directory('.', 'index.html')

    app.run(debug=True, port=5000)
