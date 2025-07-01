from flask import Blueprint, jsonify
from db import cursor

category_bp = Blueprint('category', __name__)

@category_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        cursor.execute('SELECT id, name FROM public.categories ORDER BY id')
        categories = cursor.fetchall()
        # Optionally, you can add images for each category if you have them in DB
        result = [
            {'id': row[0], 'name': row[1]} for row in categories
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
