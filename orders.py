from flask import Blueprint, request, jsonify, session
from datetime import datetime
from src.models.user import db
from src.models.order import Order
from functools import wraps

orders_bp = Blueprint('orders', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@orders_bp.route('/', methods=['GET'])
@login_required
def get_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status = request.args.get('status')
    game = request.args.get('game')
    
    query = Order.query
    
    if status:
        query = query.filter_by(status=status)
    if game:
        query = query.filter_by(game=game)
    
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'orders': [order.to_dict() for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page,
        'per_page': per_page
    }), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify(order.to_dict()), 200

@orders_bp.route('/<int:order_id>', methods=['PUT'])
@login_required
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    
    if 'status' in data:
        if data['status'] in ['pending', 'completed', 'cancelled']:
            order.status = data['status']
        else:
            return jsonify({'error': 'Invalid status'}), 400
    
    if 'notes' in data:
        order.notes = data['notes']
    
    order.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(order.to_dict()), 200

@orders_bp.route('/', methods=['POST'])
@login_required
def create_order():
    data = request.get_json()
    
    required_fields = ['game', 'game_id', 'amount', 'payment_method', 'contact']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    order = Order(
        game=data['game'],
        game_id=data['game_id'],
        amount=data['amount'],
        payment_method=data['payment_method'],
        contact=data['contact'],
        status=data.get('status', 'pending'),
        notes=data.get('notes', '')
    )
    
    db.session.add(order)
    db.session.commit()
    
    return jsonify(order.to_dict()), 201

@orders_bp.route('/<int:order_id>', methods=['DELETE'])
@login_required
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    
    return jsonify({'message': 'Order deleted successfully'}), 200

@orders_bp.route('/bulk-update', methods=['POST'])
@login_required
def bulk_update_orders():
    data = request.get_json()
    order_ids = data.get('order_ids', [])
    status = data.get('status')
    
    if not order_ids or not status:
        return jsonify({'error': 'order_ids and status are required'}), 400
    
    if status not in ['pending', 'completed', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400
    
    orders = Order.query.filter(Order.id.in_(order_ids)).all()
    
    for order in orders:
        order.status = status
        order.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': f'Updated {len(orders)} orders',
        'updated_count': len(orders)
    }), 200

