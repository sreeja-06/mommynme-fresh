from flask import Blueprint, jsonify
from psycopg2 import sql
import logging
from db import cursor

products_bp = Blueprint('products', __name__)

# List of product tables
TABLES = [
    "bags_purse", "earrings", "flower_bouquet",
    "flower_pots", "hair_accessories", "keychains_plushies", "mirror"
]

logger = logging.getLogger(__name__)

@products_bp.route('/products', methods=['GET'])
def get_all_products():
    data = {}
    try:
        for table in TABLES:
            query = sql.SQL("SELECT * FROM {} ").format(sql.Identifier(table))
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            data[table] = [dict(zip(columns, row)) for row in rows]
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch products'}), 500
@products_bp.route('/products/<table>', methods=['POST'])
def add_product(table):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        data = dict(**{k: v for k, v in flask.request.json.items()})
        columns = data.keys()
        values = [data[col] for col in columns]
        query = sql.SQL("INSERT INTO {} ({}) VALUES ({}) RETURNING *").format(
            sql.Identifier(table),
            sql.SQL(', ').join(map(sql.Identifier, columns)),
            sql.SQL(', ').join(sql.Placeholder() * len(values))
        )
        cursor.execute(query, values)
        inserted = cursor.fetchone()
        cursor.connection.commit()
        return jsonify({'success': True, 'product': dict(zip([desc[0] for desc in cursor.description], inserted))}), 201
    except Exception as e:
        logger.error(f"Error adding product: {e}", exc_info=True)
        cursor.connection.rollback()
        return jsonify({'error': 'Failed to add product'}), 500
@products_bp.route('/products/<table>/<int:product_id>', methods=['PUT'])
def update_product(table, product_id):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        data = dict(**{k: v for k, v in flask.request.json.items()})
        set_clause = sql.SQL(', ').join(
            sql.Composed([sql.Identifier(k), sql.SQL('=%s')]) for k in data.keys()
        )
        values = list(data.values())
        values.append(product_id)
        query = sql.SQL("UPDATE {} SET {} WHERE id=%s RETURNING *").format(
            sql.Identifier(table),
            set_clause
        )
        cursor.execute(query, values)
        updated = cursor.fetchone()
        cursor.connection.commit()
        if not updated:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'success': True, 'product': dict(zip([desc[0] for desc in cursor.description], updated))})
    except Exception as e:
        logger.error(f"Error updating product: {e}", exc_info=True)
        cursor.connection.rollback()
        return jsonify({'error': 'Failed to update product'}), 500
@products_bp.route('/products/<table>/<int:product_id>', methods=['DELETE'])
def delete_product(table, product_id):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        query = sql.SQL("DELETE FROM {} WHERE id=%s RETURNING *").format(sql.Identifier(table))
        cursor.execute(query, (product_id,))
        deleted = cursor.fetchone()
        cursor.connection.commit()
        if not deleted:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'success': True, 'deleted_product': dict(zip([desc[0] for desc in cursor.description], deleted))})
    except Exception as e:
        logger.error(f"Error deleting product: {e}", exc_info=True)
        cursor.connection.rollback()
        return jsonify({'error': 'Failed to delete product'}), 500

@products_bp.route('/products/count', methods=['GET'])
def count_all_products():
    try:
        total = 0
        counts = {}
        for table in TABLES:
            query = sql.SQL("SELECT COUNT(*) FROM {}").format(sql.Identifier(table))
            cursor.execute(query)
            count = cursor.fetchone()[0]
            counts[table] = count
            total += count
        return jsonify({'total_products': total, 'per_table': counts})
    except Exception as e:
        logger.error(f"Error counting products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to count products'}), 500