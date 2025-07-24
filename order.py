from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game = db.Column(db.String(100), nullable=False)
    game_id = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.String(100), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = db.Column(db.Text)

    def __repr__(self):
        return f'<Order {self.id} - {self.game}>'

    def to_dict(self):
        return {
            'id': self.id,
            'game': self.game,
            'game_id': self.game_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'contact': self.contact,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notes': self.notes
        }

