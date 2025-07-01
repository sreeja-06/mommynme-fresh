import os
from flask import Flask, jsonify
from flask_cors import CORS
from psycopg2 import sql
import logging
from contact import contact_bp
from best_seller import best_seller_bp
from category import category_bp
from db import cursor

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Read database configuration from environment variables
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
app.register_blueprint(contact_bp)
app.register_blueprint(best_seller_bp)
app.register_blueprint(category_bp)

tables = [
    "bags_purse", "earrings", "flower_bouquet",
    "flower_pots", "hair_accessories", "keychains_plushies", "mirror"
]

@app.route('/products', methods=['GET'])
def get_all_products():
    data = {}
    try:
        for table in tables:
            # Use SQL identifiers to avoid SQL injection
            query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table))
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            data[table] = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch products'}), 500

if __name__ == '__main__':
    app.run(debug=True)