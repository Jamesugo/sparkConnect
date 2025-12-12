import os
import sqlite3
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, session, send_from_directory
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer

app = Flask(__name__, static_folder='.')
app.secret_key = 'super_secret_key_change_this_later'

# Email Configuration (Gmail SMTP)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')  # Set via environment variable
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'your-app-password')  # Set via environment variable
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME', 'your-email@gmail.com')

mail = Mail(app)
serializer = URLSafeTimedSerializer(app.secret_key)

DATABASE = 'sparkconnect.db'
UPLOAD_FOLDER = 'assets/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        db = get_db()
        # Users table
        db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                specialty TEXT,
                location TEXT,
                state TEXT,
                phone TEXT,
                whatsapp TEXT,
                description TEXT,
                image TEXT,
                gallery TEXT,
                reviews_data TEXT,
                rating REAL DEFAULT 0,
                reviews INTEGER DEFAULT 0,
                reset_token TEXT,
                reset_token_expiry TIMESTAMP
            )
        ''')
        
        # Check if we have default users, if not, create them (optional for seed)
        cur = db.execute('SELECT count(*) FROM users')
        if cur.fetchone()[0] == 0:
            # Seed basic users if empty
            defaults = [
                 {
                    "name": "Sarah Johnson", "specialty": "Residential Wiring", "rating": 4.8, "reviews": 120,
                    "location": "Lagos", "state": "Lagos", "image": "assets/images/profile1.jpg", 
                    "description": "Expert in residential wiring and lighting installations.", "email": "sarah@example.com"
                },
                {
                    "name": "Michael Chen", "specialty": "Commercial Systems", "rating": 4.9, "reviews": 150,
                    "location": "Abuja", "state": "FCT - Abuja", "image": "assets/images/profile2.jpg",
                    "description": "Specializes in commercial electrical systems.", "email": "michael@example.com"
                },
                {
                    "name": "Admin", "specialty": "Administrator", "rating": 0, "reviews": 0,
                    "location": "Nigeria", "state": "FCT - Abuja", "image": "assets/images/profile_placeholder.jpg",
                    "description": "SparkConnect Administrator", "email": "admin@sparkconnect.com"
                }
            ]
            for u in defaults:
                # Admin gets password 'admin123', others get 'password'
                pwd = 'admin123' if u['email'] == 'admin@sparkconnect.com' else 'password'
                db.execute('INSERT INTO users (name, email, password, specialty, location, state, image, description, rating, reviews, gallery, reviews_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                           (u['name'], u['email'], generate_password_hash(pwd), u['specialty'], u['location'], u['state'], u['image'], u['description'], u['rating'], u['reviews'], '[]', '[]'))
            db.commit()
            print("Seeded database with default users (including admin).")

        db.commit()
        db.close()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html') # Fallback-ish

# --- API ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    specialty = data.get('specialty')
    state = data.get('state')
    
    if not email or not password or not name:
        return jsonify({'error': 'Missing required fields'}), 400
    
    db = get_db()
    try:
        db.execute('INSERT INTO users (email, password, name, specialty, state, gallery, reviews_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (email, generate_password_hash(password), name, specialty, state, '[]', '[]'))
        db.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409
    finally:
        db.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password')
    
    db = get_db()
    # Support username login for legacy/demo feel or email
    user = db.execute('SELECT * FROM users WHERE lower(email) = ? OR lower(name) = ?', (email, email)).fetchone()
    db.close()
    
    if user and check_password_hash(user['password'], password):
        session['user_id'] = user['id']
        return jsonify({
            'message': 'Logged in',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify(None), 200 # No user logged in
    
    db = get_db()
    user = db.execute('SELECT id, name, email, specialty, location, state, phone, whatsapp, description, image, gallery, reviews_data FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    db.close()
    
    if user:
        # Parse JSON fields
        u_dict = dict(user)
        try:
            u_dict['gallery'] = json.loads(user['gallery']) if user['gallery'] else []
        except:
            u_dict['gallery'] = []
        try:
             u_dict['reviewsList'] = json.loads(user['reviews_data']) if user['reviews_data'] else []
        except:
             u_dict['reviewsList'] = []
             
        del u_dict['reviews_data']
        return jsonify(u_dict)
    return jsonify(None), 200

@app.route('/api/user/update', methods=['PUT'])
def update_user():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    db = get_db()
    
    # Whitelist fields to update
    fields = ['name', 'specialty', 'location', 'state', 'phone', 'whatsapp', 'description', 'image', 'email']
    query_parts = []
    params = []
    
    for field in fields:
        if field in data:
            query_parts.append(f"{field} = ?")
            params.append(data[field])
            
    if query_parts:
        params.append(session['user_id'])
        db.execute(f"UPDATE users SET {', '.join(query_parts)} WHERE id = ?", params)
        db.commit()
    
    db.close()
    return jsonify({'message': 'Profile updated'})

@app.route('/api/electricians', methods=['GET'])
def get_electricians():
    db = get_db()
    users = db.execute('SELECT id, name, specialty, location, state, image, description, rating, reviews, gallery, reviews_data FROM users').fetchall()
    db.close()
    
    result = []
    for u in users:
        u_dict = dict(u)
        try:
            u_dict['gallery'] = json.loads(u['gallery']) if u['gallery'] else []
        except:
            u_dict['gallery'] = []
        try:
             u_dict['reviewsList'] = json.loads(u['reviews_data']) if u['reviews_data'] else []
        except:
             u_dict['reviewsList'] = []
        del u_dict['reviews_data']
        result.append(u_dict)
        
    return jsonify(result)

@app.route('/api/electricians/<int:id>/review', methods=['POST'])
def add_review(id):
    data = request.json
    rating = data.get('rating')
    name = data.get('name')
    comment = data.get('comment')
    
    if not rating or not name:
        return jsonify({'error': 'Missing rating or name'}), 400
        
    db = get_db()
    user = db.execute('SELECT reviews_data, rating, reviews FROM users WHERE id = ?', (id,)).fetchone()
    
    if not user:
        db.close()
        return jsonify({'error': 'Electrician not found'}), 404
        
    try:
        reviews_list = json.loads(user['reviews_data']) if user['reviews_data'] else []
    except:
        reviews_list = []
        
    new_review = {
        'rating': rating,
        'name': name,
        'comment': comment,
        'date': data.get('date') # pass through or generate server side
    }
    
    reviews_list.append(new_review)
    
    # Recalculate
    total_rating = sum(r['rating'] for r in reviews_list)
    new_avg = round(total_rating / len(reviews_list), 1)
    new_count = len(reviews_list)
    
    db.execute('UPDATE users SET reviews_data = ?, rating = ?, reviews = ? WHERE id = ?', 
               (json.dumps(reviews_list), new_avg, new_count, id))
    db.commit()
    db.close()
    
    return jsonify({'message': 'Review added', 'rating': new_avg, 'reviews': new_count})


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
        
    db = get_db()
    user = db.execute('SELECT gallery FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    
    if user:
        try:
            gallery = json.loads(user['gallery']) if user['gallery'] else []
        except:
            gallery = []
        
        if isinstance(new_item, list):
             gallery.extend(new_item)
        else:
             gallery.append(new_item)
             
        db.execute('UPDATE users SET gallery = ? WHERE id = ?', (json.dumps(gallery), session['user_id']))
        db.commit()
        db.close()
        return jsonify({'gallery': gallery})
        
    db.close()
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/user/gallery', methods=['DELETE'])
def remove_from_gallery():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    item_to_remove = data.get('url')
    
    db = get_db()
    user = db.execute('SELECT gallery FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    
    if user:
        try:
            gallery = json.loads(user['gallery']) if user['gallery'] else []
        except:
            gallery = []
            
        if item_to_remove in gallery:
            gallery.remove(item_to_remove)
            
            # Optional: Delete actual file from disk if we want to be clean
            # but that requires parsing the URL to path. Skip for now.
            
            db.execute('UPDATE users SET gallery = ? WHERE id = ?', (json.dumps(gallery), session['user_id']))
            db.commit()
            
        db.close()
        return jsonify({'gallery': gallery})
    
    db.close()
    return jsonify({'error': 'User not found'}), 404


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    """Admin endpoint to delete a user account"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    db = get_db()
    # Check if current user is admin
    current_user = db.execute('SELECT email FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    
    if not current_user or current_user['email'] != 'admin@sparkconnect.com':
        db.close()
        return jsonify({'error': 'Admin access required'}), 403
    
    # Don't allow admin to delete themselves
    if user_id == session['user_id']:
        db.close()
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    # Delete the user
    db.execute('DELETE FROM users WHERE id = ?', (user_id,))
    db.commit()
    db.close()
    
    return jsonify({'message': 'User deleted successfully'})


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email"""
    data = request.json
    email = data.get('email', '').lower()
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    db = get_db()
    user = db.execute('SELECT id, name, email FROM users WHERE lower(email) = ?', (email,)).fetchone()
    
    if not user:
        # Don't reveal if email exists or not (security best practice)
        return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200
    
    # Generate reset token
    token = serializer.dumps(user['email'], salt='password-reset-salt')
    expiry = datetime.now() + timedelta(hours=1)  # Token valid for 1 hour
    
    # Save token to database
    db.execute('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
               (token, expiry, user['id']))
    db.commit()
    db.close()
    
    # Send email
    try:
        reset_url = f"http://127.0.0.1:5000/reset-password.html?token={token}"
        msg = Message(
            'Password Reset Request - SparkConnect',
            recipients=[user['email']]
        )
        msg.body = f"""Hello {user['name']},

You requested to reset your password for your SparkConnect account.

Click the link below to reset your password (valid for 1 hour):
{reset_url}

If you didn't request this, please ignore this email.

Best regards,
SparkConnect Team
"""
        msg.html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Password Reset Request</h2>
                <p>Hello {user['name']},</p>
                <p>You requested to reset your password for your SparkConnect account.</p>
                <p>Click the button below to reset your password (valid for 1 hour):</p>
                <a href="{reset_url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; word-break: break-all;">{reset_url}</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p style="margin-top: 30px; color: #666;">Best regards,<br>SparkConnect Team</p>
            </div>
        </body>
        </html>
        """
        mail.send(msg)
        print(f"Password reset email sent to {user['email']}")
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Still return success to user (don't reveal email sending issues)
    
    return jsonify({'message': 'If that email exists, a reset link has been sent'}), 200


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password with token"""
    data = request.json
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400
    
    # Verify token
    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hour
    except:
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    db = get_db()
    user = db.execute('SELECT id, reset_token, reset_token_expiry FROM users WHERE lower(email) = ?', 
                      (email.lower(),)).fetchone()
    
    if not user or user['reset_token'] != token:
        db.close()
        return jsonify({'error': 'Invalid reset token'}), 400
    
    # Check if token expired
    if user['reset_token_expiry']:
        expiry = datetime.fromisoformat(user['reset_token_expiry'])
        if datetime.now() > expiry:
            db.close()
            return jsonify({'error': 'Reset token has expired'}), 400
    
    # Update password and clear reset token
    hashed_password = generate_password_hash(new_password)
    db.execute('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
               (hashed_password, user['id']))
    db.commit()
    db.close()
    
    return jsonify({'message': 'Password reset successfully'}), 200


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
