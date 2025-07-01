from flask import Blueprint, jsonify
from db import cursor

best_seller_bp = Blueprint('best_seller', __name__)

@best_seller_bp.route('/best_sellers', methods=['GET'])
def get_best_sellers():
    try:
        cursor.execute("SELECT * FROM best_seller")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        data = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
