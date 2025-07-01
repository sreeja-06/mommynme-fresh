import os
from flask import Flask, jsonify
from flask_cors import CORS
import logging
from contact import contact_bp
from best_seller import best_seller_bp
from category import category_bp
from products import products_bp
from auth import auth_bp

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
app.register_blueprint(products_bp)
app.register_blueprint(auth_bp)
if __name__ == '__main__':
    app.run(debug=True)