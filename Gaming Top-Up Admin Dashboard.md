# Gaming Top-Up Admin Dashboard

A comprehensive admin dashboard for managing gaming top-up orders with a modern, responsive interface.

## 🚀 Live Demo

**Deployed URL:** https://lnh8imcjz0kw.manus.space

## 🔐 Default Admin Credentials

- **Username:** admin
- **Password:** admin123

> ⚠️ **Important:** Please change the default password after first login for security.

## ✨ Features

### 🎯 Dashboard Overview
- Real-time statistics display
- Total orders, pending orders, completed orders
- Recent orders tracking (last 7 days)
- Visual charts for orders by game and payment methods

### 📋 Order Management
- Complete order listing with pagination
- Advanced filtering by status and game
- Individual order editing with status updates
- Bulk operations (mark multiple orders as completed/cancelled)
- Order details modal with notes functionality

### 🔒 Authentication System
- Secure admin login/logout
- Session-based authentication
- Password hashing with Werkzeug

### 📱 Responsive Design
- Modern dark theme with cyan accents
- Mobile-friendly responsive layout
- Professional UI with smooth animations
- FontAwesome icons integration

## 🛠️ Technical Stack

### Backend
- **Framework:** Flask 3.1.1
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** Session-based with password hashing
- **CORS:** Enabled for cross-origin requests

### Frontend
- **Technologies:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom CSS with responsive design
- **Icons:** FontAwesome 6.0.0
- **Architecture:** Single Page Application (SPA)

### Database Models
- **Admin:** User management with password hashing
- **Order:** Complete order tracking with status management
- **User:** Basic user model (extensible)

## 📁 Project Structure

```
gaming-topup-admin/
├── src/
│   ├── models/
│   │   ├── admin.py          # Admin user model
│   │   ├── order.py          # Order management model
│   │   └── user.py           # Base user model
│   ├── routes/
│   │   ├── admin.py          # Admin authentication routes
│   │   ├── orders.py         # Order management routes
│   │   └── user.py           # User routes
│   ├── static/
│   │   ├── index.html        # Main dashboard interface
│   │   ├── styles.css        # Custom styling
│   │   └── script.js         # Frontend functionality
│   ├── database/
│   │   └── app.db           # SQLite database
│   └── main.py              # Flask application entry point
├── venv/                    # Virtual environment
├── init_db.py              # Database initialization script
├── requirements.txt        # Python dependencies
└── README.md              # This documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Order Management
- `GET /api/orders/` - List orders with pagination and filtering
- `GET /api/orders/<id>` - Get specific order details
- `PUT /api/orders/<id>` - Update order status and notes
- `POST /api/orders/` - Create new order
- `DELETE /api/orders/<id>` - Delete order
- `POST /api/orders/bulk-update` - Bulk update order status

## 🚀 Local Development

### Prerequisites
- Python 3.11+
- Virtual environment support

### Setup Instructions

1. **Clone and Navigate**
   ```bash
   cd gaming-topup-admin
   ```

2. **Activate Virtual Environment**
   ```bash
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize Database**
   ```bash
   python init_db.py
   ```

5. **Run Development Server**
   ```bash
   python src/main.py
   ```

6. **Access Dashboard**
   Open http://localhost:5000 in your browser

## 📊 Database Schema

### Admin Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `is_active`
- `created_at`
- `last_login`

### Order Table
- `id` (Primary Key)
- `game`
- `game_id`
- `amount`
- `payment_method`
- `contact`
- `status` (pending/completed/cancelled)
- `created_at`
- `updated_at`
- `notes`

## 🎮 Supported Games

- Free Fire
- PUBG Mobile
- Mobile Legends

## 💳 Payment Methods

- Khalti
- eSewa
- Bank Transfer

## 🔒 Security Features

- Password hashing using Werkzeug
- Session-based authentication
- CSRF protection ready
- Input validation and sanitization

## 📱 Mobile Responsiveness

The dashboard is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI/UX Features

- **Dark Theme:** Professional gaming-oriented design
- **Smooth Animations:** Hover effects and transitions
- **Loading States:** Visual feedback for user actions
- **Modal Dialogs:** Clean order editing interface
- **Status Badges:** Color-coded order status indicators
- **Charts:** Visual representation of data

## 🔄 Future Enhancements

- Advanced analytics and reporting
- Email notifications for order updates
- Multi-admin support with role-based permissions
- Order export functionality
- Real-time notifications
- Payment gateway integration
- Customer portal integration

## 🐛 Troubleshooting

### Common Issues

1. **Database Not Found**
   - Run `python init_db.py` to initialize the database

2. **Login Issues**
   - Ensure you're using the correct credentials (admin/admin123)
   - Check if the admin user exists in the database

3. **CORS Errors**
   - CORS is already configured for all origins
   - Ensure the Flask server is running

### Support

For technical support or questions, please refer to the source code comments or contact the development team.

## 📄 License

This project is developed for gaming top-up service management. All rights reserved.

---

**Developed with ❤️ for Gaming Top-Up Services**

