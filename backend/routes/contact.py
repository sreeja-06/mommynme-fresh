from flask import Blueprint, request, jsonify
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

contact_bp = Blueprint('contact', __name__)

def get_db_connection():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT
    )
    return conn

@contact_bp.route('/contact', methods=['POST'])
def create_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    subject = data.get('subject')
    message = data.get('message')
    if not all([name, email, subject, message]):
        return jsonify({'error': 'All fields are required'}), 400
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO contact (name, email, subject, message) VALUES (%s, %s, %s, %s)",
            (name, email, subject, message)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Contact form submitted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contact_bp.route('/contact', methods=['GET'])
def get_contacts():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, name, email, subject, message FROM contact ORDER BY id DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        contacts = [
            {'id': row[0], 'name': row[1], 'email': row[2], 'subject': row[3], 'message': row[4]}
            for row in rows
        ]
        return jsonify(contacts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
