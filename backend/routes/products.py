from flask import Blueprint, jsonify, request, send_from_directory
from psycopg2 import sql
import logging
import os
from db import cursor

products_bp = Blueprint('products', __name__)

# List of product tables
TABLES = [
    "bags_purse", "earrings", "flower_bouquet",
    "flower_pots", "hair_accessories", "keychains_plushies", "mirror"
]

logger = logging.getLogger(__name__)

def process_image_urls(image_urls):
    """
    Accepts a comma-separated string or list of image URLs, returns a list of processed URLs.
    Prepends 'back_assets/' if not already present.
    """
    if not image_urls:
        return []
    if isinstance(image_urls, str):
        urls = [u.strip() for u in image_urls.split(',') if u.strip()]
    elif isinstance(image_urls, list):
        urls = image_urls
    else:
        return []
    # Prepend 'back_assets/' if not already present
    processed = []
    for url in urls:
        if not url.startswith('back_assets/'):
            processed.append(f'back_assets/{url}')
        else:
            processed.append(url)
    return processed

@products_bp.route('/products', methods=['GET'])
def get_all_products():
    data = {}
    try:
        for table in TABLES:
            query = sql.SQL("SELECT * FROM {} ").format(sql.Identifier(table))
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            products = []
            for row in rows:
                prod = dict(zip(columns, row))
                # Add images array from image_urls or image_url
                images = []
                if 'image_urls' in prod and prod['image_urls']:
                    images = process_image_urls(prod['image_urls'])
                elif 'image_url' in prod and prod['image_url']:
                    images = [prod['image_url']]
                prod['images'] = images
                products.append(prod)
            data[table] = products
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error fetching products: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch products'}), 500
@products_bp.route('/products/<table>', methods=['POST'])
def add_product(table):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        data = dict(**{k: v for k, v in request.json.items()})
        # Process image_urls if present
        if 'image_urls' in data:
            # Store as comma-separated string
            images = process_image_urls(data['image_urls'])
            data['image_urls'] = ','.join(images)
            # Optionally set image_url as the first image
            if images:
                data['image_url'] = images[0]
        elif 'image_url' in data:
            data['image_url'] = data['image_url']
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
        prod = dict(zip([desc[0] for desc in cursor.description], inserted))
        # Add images array to response
        if 'image_urls' in prod and prod['image_urls']:
            prod['images'] = process_image_urls(prod['image_urls'])
        elif 'image_url' in prod and prod['image_url']:
            prod['images'] = [prod['image_url']]
        else:
            prod['images'] = []
        return jsonify({'success': True, 'product': prod}), 201
    except Exception as e:
        logger.error(f"Error adding product: {e}", exc_info=True)
        cursor.connection.rollback()
        return jsonify({'error': 'Failed to add product'}), 500
@products_bp.route('/products/<table>/<int:product_id>', methods=['PUT'])
def update_product(table, product_id):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        data = dict(**{k: v for k, v in request.json.items()})
        # Process image_urls if present
        if 'image_urls' in data:
            images = process_image_urls(data['image_urls'])
            data['image_urls'] = ','.join(images)
            if images:
                data['image_url'] = images[0]
        elif 'image_url' in data:
            data['image_url'] = data['image_url']
        if not data:
            return jsonify({'error': 'No data provided for update'}), 400
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
        prod = dict(zip([desc[0] for desc in cursor.description], updated))
        if 'image_urls' in prod and prod['image_urls']:
            prod['images'] = process_image_urls(prod['image_urls'])
        elif 'image_url' in prod and prod['image_url']:
            prod['images'] = [prod['image_url']]
        else:
            prod['images'] = []
        return jsonify({'success': True, 'product': prod})
    except Exception as e:
        logger.error(f"Error updating product: {e}", exc_info=True)
        cursor.connection.rollback()
        return jsonify({'error': 'Failed to update product'}), 500

@products_bp.route('/products/<table>/<int:product_id>', methods=['DELETE'])
def delete_product(table, product_id):
    if table not in TABLES:
        return jsonify({'error': 'Invalid product table'}), 400
    try:
        # Ensure autocommit is off and use a new cursor for safety
        conn = cursor.connection
        with conn.cursor() as cur:
            query = sql.SQL("DELETE FROM {} WHERE id=%s RETURNING *").format(sql.Identifier(table))
            cur.execute(query, (product_id,))
            deleted = cur.fetchone()
            if not deleted:
                conn.rollback()
                return jsonify({'error': 'Product not found'}), 404
            conn.commit()
            deleted_prod = dict(zip([desc[0] for desc in cur.description], deleted))
            # Add images array to response for consistency
            if 'image_urls' in deleted_prod and deleted_prod['image_urls']:
                deleted_prod['images'] = process_image_urls(deleted_prod['image_urls'])
            elif 'image_url' in deleted_prod and deleted_prod['image_url']:
                deleted_prod['images'] = [deleted_prod['image_url']]
            else:
                deleted_prod['images'] = []
            return jsonify({'success': True, 'deleted_product': deleted_prod})
    except Exception as e:
        logger.error(f"Error deleting product: {e}", exc_info=True)
        try:
            cursor.connection.rollback()
        except Exception:
            pass
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

@products_bp.route('/back_assets/<path:filename>')
def serve_back_assets(filename):
    """
    Serves static files from the back_assets directory.
    """
    back_assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'back_assets')
    return send_from_directory(back_assets_dir, filename)