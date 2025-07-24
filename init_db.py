#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db
from src.models.admin import Admin
from src.models.order import Order
from datetime import datetime

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if admin already exists
        existing_admin = Admin.query.filter_by(username='admin').first()
        if not existing_admin:
            # Create default admin user
            admin = Admin(
                username='admin',
                email='admin@gaming-topup.com'
            )
            admin.set_password('admin123')  # Default password
            db.session.add(admin)
            
            print("Created default admin user:")
            print("Username: admin")
            print("Password: admin123")
            print("Please change the password after first login!")
        else:
            print("Admin user already exists")
        
        # Add some sample orders for testing
        sample_orders = [
            {
                'game': 'Free Fire',
                'game_id': 'FF123456789',
                'amount': '100💎 – Rs. 85',
                'payment_method': 'Khalti',
                'contact': '9812345678',
                'status': 'pending'
            }
        ]
        
        # Check if orders already exist
        existing_orders = Order.query.count()
        if existing_orders == 0:
            for order_data in sample_orders:
                order = Order(**order_data)
                db.session.add(order)
            print(f"Added {len(sample_orders)} sample orders")
        else:
            print(f"Database already contains {existing_orders} orders")
        
        db.session.commit()
        print("Database initialization completed!")

if __name__ == '__main__':
    init_database()

