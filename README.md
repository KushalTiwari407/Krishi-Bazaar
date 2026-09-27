# Krishi Bazaar - Nepal Agricultural Marketplace

A web-based marketplace connecting Nepali farmers directly with customers.

## Features

- **User Authentication**: Separate login for farmers and customers
- **Product Management**: Farmers can list, update, and delete their products
- **Marketplace**: Customers can browse and search for agricultural products
- **Order System**: Place orders with delivery options
- **Messaging**: Direct communication between farmers and customers
- **Nepal Map Integration**: View farmers and products by district
- **Dashboard**: Real-time statistics and analytics

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Database**: SQLite3
- **Authentication**: bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

```bash
npm run init-db
```

This will create the SQLite database and populate it with sample data.

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

### 4. Open the Application

Open your browser and go to:
```
http://localhost:3000/index.html
```

## 👥 Sample Login Credentials

### Farmer Account
- **Email**: ram@farmer.com
- **Password**: farmer123

### Customer Account
- **Email**: rajesh@customer.com
- **Password**: customer123

## Project Structure

```
Krishi-Bazaar/
├── index.html              # Login/Register page
├── farmer-dashboard.html   # Farmer dashboard
├── customer-dashboard.html # Customer dashboard
├── mp.html                 # Marketplace page
├── product-listing.html    # Farmer's product management
├── messaging.html          # Messaging system
├── nepal-map.html          # Nepal districts map
├── profile.html            # User profile page
├── style.css              # Main stylesheet
├── js/
│   ├── api.js             # API client functions
│   └── utils.js           # Utility functions
├── server.js              # Express server
├── init-db.js             # Database initialization
├── package.json           # Node.js dependencies
└── krishi-bazaar.db       # SQLite database (created after init)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/user/:userId` - Get user's orders
- `PUT /api/orders/:id/status` - Update order status

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:userId1/:userId2` - Get conversation
- `GET /api/conversations/:userId` - Get user's conversations

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Statistics
- `GET /api/stats/dashboard/:userId` - Get dashboard statistics

## Development

### Run in Development Mode (with auto-restart)

```bash
npm run dev
```

### Reset Database

To reset the database and reload sample data:

```bash
rm krishi-bazaar.db
npm run init-db
```

## Key Features Implementation

### 1. Real-time Data Updates
All pages now fetch data from the database in real-time.

### 2. User Authentication
- Passwords are hashed using bcryptjs
- Session management using sessionStorage
- Protected routes redirect to login if not authenticated

### 3. Database Schema

**Users Table**
- id, name, email, phone, password, user_type, location, created_at

**Products Table**
- id, farmer_id, name, category, variety, stock, unit, price, description, created_at

**Orders Table**
- id, customer_id, product_id, farmer_id, quantity, total_price, delivery_method, delivery_date, status, created_at

**Messages Table**
- id, sender_id, receiver_id, message, is_read, created_at

## Pages Overview

1. **index.html** - Login and registration
2. **farmer-dashboard.html** - Farmer's main dashboard with stats
3. **customer-dashboard.html** - Customer's main dashboard
4. **mp.html** - Marketplace for browsing products
5. **product-listing.html** - Farmer's product management
6. **messaging.html** - Direct messaging between users
7. **nepal-map.html** - Interactive Nepal map
8. **profile.html** - User profile management

## Security Notes

- Passwords are hashed before storage
- SQL injection protection via parameterized queries
- CORS enabled for local development
- Input validation on both client and server side

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change it in `server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

### Database Errors
If you encounter database errors, try resetting the database:
```bash
rm krishi-bazaar.db
npm run init-db
```

### Module Not Found
Make sure you've installed dependencies:
```bash
npm install
```

## Notes

- The frontend serves static HTML files
- The backend API runs on Express.js
- SQLite database is stored as a single file: `krishi-bazaar.db`
- All dates are stored in ISO format
- Currency is in Nepali Rupees (NPR)

## Next Steps / Future Enhancements

- [ ] Image upload for products
- [ ] Real-time notifications using WebSockets
- [ ] Payment gateway integration
- [ ] Mobile responsive improvements
- [ ] Advanced search and filters
- [ ] Rating and review system
- [ ] Multi-language support (Nepali/English)

## License

This project is for educational purposes.
