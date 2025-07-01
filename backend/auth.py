from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import bcrypt
from db import cursor, conn

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/signup', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    try:
        cursor.execute("SELECT id FROM signup WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"message": "Email already exists."}), 409
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute("INSERT INTO signup (email, password) VALUES (%s, %s)", (email, hashed.decode('utf-8')))
        conn.commit()
        return jsonify({"message": "Signup successful"}), 200
    except Exception as e:
        return jsonify({"message": "Server error: " + str(e)}), 500

@auth_bp.route('/api/auth/login', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400
    try:
        cursor.execute("SELECT password FROM signup WHERE email = %s", (email,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"message": "Invalid email or password."}), 401
        hashed = row[0].encode('utf-8')
        if not bcrypt.checkpw(password.encode('utf-8'), hashed):
            return jsonify({"message": "Invalid email or password."}), 401
        return jsonify({"message": "Login successful"}), 200
    except Exception as e:
        return jsonify({"message": "Server error: " + str(e)}), 500

@auth_bp.route('/api/auth/users', methods=['GET'])
@cross_origin(origins=["http://localhost:5173"])
def get_users():
    try:
        cursor.execute("SELECT id, email FROM signup")
        users = cursor.fetchall()
        user_list = [{"id": user[0], "email": user[1]} for user in users]
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"message": "Server error: " + str(e)}), 500