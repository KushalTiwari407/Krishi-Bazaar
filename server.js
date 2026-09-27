const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database connection
const db = new sqlite3.Database('./krishi-bazaar.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { name, email, phone, password, userType, location } = req.body;
    
    try {
        // Check if user already exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            
            if (user) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert new user
            const sql = `INSERT INTO users (name, email, phone, password, user_type, location, created_at) 
                        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;
            
            db.run(sql, [name, email, phone, hashedPassword, userType, location], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Error creating user' });
                }
                
                res.json({
                    success: true,
                    message: 'User registered successfully',
                    userId: this.lastID
                });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        // Don't send password back
        delete user.password;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                type: user.user_type,
                location: user.location
            }
        });
    });
});

// Get all farmers
app.get('/api/farmers', (req, res) => {
    db.all('SELECT id, name, email, phone, location, created_at FROM users WHERE user_type = ?', ['farmer'], (err, farmers) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, farmers: farmers });
    });
});

// Get all users
app.get('/api/auth/users', (req, res) => {
    db.all('SELECT id, name, email, phone, user_type, location, created_at FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json(users);
    });
});

// Get user by ID
app.get('/api/auth/user/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT id, name, email, phone, user_type, location, created_at FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json(user);
    });
});

// Update user profile
app.put('/api/auth/user/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, location } = req.body;
    
    db.run('UPDATE users SET name = ?, phone = ?, location = ? WHERE id = ?',
        [name, phone, location, id],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error updating user' });
            }
            
            if (this.changes === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            
            res.json({ success: true, message: 'Profile updated successfully' });
        });
});

// ============================================
// PRODUCT ROUTES
// ============================================

// Get all products (with filters)
app.get('/api/products', (req, res) => {
    const { category, location, minPrice, maxPrice, search } = req.query;
    
    let sql = `SELECT p.*, u.name as farmer_name, u.location as farmer_location, u.phone as farmer_phone
               FROM products p
               JOIN users u ON p.farmer_id = u.id
               WHERE 1=1`;
    
    const params = [];
    
    if (category && category !== 'all') {
        sql += ' AND p.category = ?';
        params.push(category);
    }
    
    if (location && location !== 'all') {
        sql += ' AND u.location LIKE ?';
        params.push(`%${location}%`);
    }
    
    if (minPrice) {
        sql += ' AND p.price >= ?';
        params.push(minPrice);
    }
    
    if (maxPrice) {
        sql += ' AND p.price <= ?';
        params.push(maxPrice);
    }
    
    if (search) {
        sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    db.all(sql, params, (err, products) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching products' });
        }
        
        res.json({ success: true, products });
    });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const sql = `SELECT p.*, u.name as farmer_name, u.location as farmer_location, 
                 u.phone as farmer_phone, u.email as farmer_email
                 FROM products p
                 JOIN users u ON p.farmer_id = u.id
                 WHERE p.id = ?`;
    
    db.get(sql, [req.params.id], (err, product) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching product' });
        }
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, product });
    });
});

// Create new product (farmer only)
app.post('/api/products', (req, res) => {
    const { farmer_id, farmerId, name, category, variety, stock, unit, price, description } = req.body;
    
    // Support both farmer_id and farmerId
    const actualFarmerId = farmer_id || farmerId;
    
    if (!actualFarmerId || !name || !category || !price || stock === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: farmer_id, name, category, price, stock' 
        });
    }
    
    const sql = `INSERT INTO products (farmer_id, name, category, variety, stock, unit, price, description, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
    
    db.run(sql, [actualFarmerId, name, category, variety, stock, unit, price, description], function(err) {
        if (err) {
            console.error('Error creating product:', err);
            return res.status(500).json({ success: false, message: 'Error creating product', error: err.message });
        }
        
        res.json({
            success: true,
            message: 'Product created successfully',
            id: this.lastID,
            productId: this.lastID
        });
    });
});

// Update product
app.put('/api/products/:id', (req, res) => {
    const { name, category, variety, stock, unit, price, description } = req.body;
    
    const sql = `UPDATE products 
                 SET name = ?, category = ?, variety = ?, stock = ?, unit = ?, price = ?, description = ?
                 WHERE id = ?`;
    
    db.run(sql, [name, category, variety, stock, unit, price, description, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating product' });
        }
        
        res.json({ success: true, message: 'Product updated successfully' });
    });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error deleting product' });
        }
        
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// Get products by farmer
app.get('/api/products/farmer/:farmerId', (req, res) => {
    const sql = `SELECT p.*, u.name as farmer_name, u.location as farmer_location
                 FROM products p
                 JOIN users u ON p.farmer_id = u.id
                 WHERE p.farmer_id = ?
                 ORDER BY p.created_at DESC`;
    
    db.all(sql, [req.params.farmerId], (err, products) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching farmer products' });
        }
        res.json(products);
    });
});

// ============================================
// ORDER ROUTES
// ============================================

// Get all orders
app.get('/api/orders', (req, res) => {
    const sql = `SELECT o.*, 
                 p.name as product_name, 
                 c.name as customer_name, 
                 f.name as farmer_name
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users c ON o.customer_id = c.id
                 JOIN users f ON o.farmer_id = f.id
                 ORDER BY o.created_at DESC`;
    
    db.all(sql, [], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching orders' });
        }
        res.json(orders);
    });
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
    const sql = `SELECT o.*, 
                 p.name as product_name, 
                 c.name as customer_name, c.phone as customer_phone,
                 f.name as farmer_name, f.phone as farmer_phone
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users c ON o.customer_id = c.id
                 JOIN users f ON o.farmer_id = f.id
                 WHERE o.id = ?`;
    
    db.get(sql, [req.params.id], (err, order) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching order' });
        }
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json(order);
    });
});

// Create new order
app.post('/api/orders', (req, res) => {
    const { customerId, productId, farmerId, quantity, totalPrice, deliveryMethod, deliveryDate } = req.body;
    
    const sql = `INSERT INTO orders (customer_id, product_id, farmer_id, quantity, total_price, 
                 delivery_method, delivery_date, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`;
    
    db.run(sql, [customerId, productId, farmerId, quantity, totalPrice, deliveryMethod, deliveryDate], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error creating order' });
        }
        
        // Update product stock
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId]);
        
        res.json({
            success: true,
            message: 'Order placed successfully',
            orderId: this.lastID
        });
    });
});

// Get orders by user
app.get('/api/orders/user/:userId', (req, res) => {
    const { userId } = req.params;
    const { userType } = req.query;
    
    let sql;
    if (userType === 'farmer') {
        sql = `SELECT o.*, p.name as product_name, u.name as customer_name, u.phone as customer_phone
               FROM orders o
               JOIN products p ON o.product_id = p.id
               JOIN users u ON o.customer_id = u.id
               WHERE o.farmer_id = ?
               ORDER BY o.created_at DESC`;
    } else {
        sql = `SELECT o.*, p.name as product_name, u.name as farmer_name, u.phone as farmer_phone
               FROM orders o
               JOIN products p ON o.product_id = p.id
               JOIN users u ON o.farmer_id = u.id
               WHERE o.customer_id = ?
               ORDER BY o.created_at DESC`;
    }
    
    db.all(sql, [userId], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching orders' });
        }
        
        res.json({ success: true, orders });
    });
});

// Get orders by customer
app.get('/api/orders/customer/:customerId', (req, res) => {
    const sql = `SELECT o.*, p.name as product_name, u.name as farmer_name, u.phone as farmer_phone
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users u ON o.farmer_id = u.id
                 WHERE o.customer_id = ?
                 ORDER BY o.created_at DESC`;
    
    db.all(sql, [req.params.customerId], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching orders' });
        }
        res.json(orders);
    });
});

// Get orders by farmer
app.get('/api/orders/farmer/:farmerId', (req, res) => {
    const sql = `SELECT o.*, p.name as product_name, u.name as customer_name, u.phone as customer_phone
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 JOIN users u ON o.customer_id = u.id
                 WHERE o.farmer_id = ?
                 ORDER BY o.created_at DESC`;
    
    db.all(sql, [req.params.farmerId], (err, orders) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching orders' });
        }
        res.json(orders);
    });
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating order status' });
        }
        
        res.json({ success: true, message: 'Order status updated' });
    });
});

// ============================================
// MESSAGE ROUTES
// ============================================

// Send message
app.post('/api/messages', (req, res) => {
    const { senderId, receiverId, message } = req.body;
    
    const sql = `INSERT INTO messages (sender_id, receiver_id, message, created_at)
                 VALUES (?, ?, ?, datetime('now'))`;
    
    db.run(sql, [senderId, receiverId, message], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error sending message' });
        }
        
        res.json({
            success: true,
            message: 'Message sent successfully',
            messageId: this.lastID
        });
    });
});

// Get conversation between two users
app.get('/api/messages/conversation/:userId1/:userId2', (req, res) => {
    const { userId1, userId2 } = req.params;
    
    const sql = `SELECT m.*, 
                 s.name as sender_name, 
                 r.name as receiver_name
                 FROM messages m
                 JOIN users s ON m.sender_id = s.id
                 JOIN users r ON m.receiver_id = r.id
                 WHERE (m.sender_id = ? AND m.receiver_id = ?)
                    OR (m.sender_id = ? AND m.receiver_id = ?)
                 ORDER BY m.created_at ASC`;
    
    db.all(sql, [userId1, userId2, userId2, userId1], (err, messages) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching messages' });
        }
        res.json(messages);
    });
});

// Get user's messages/conversations
app.get('/api/messages/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    const sql = `SELECT DISTINCT 
                 CASE 
                     WHEN m.sender_id = ? THEN m.receiver_id 
                     ELSE m.sender_id 
                 END as other_user_id,
                 u.name as other_user_name,
                 MAX(m.created_at) as last_message_time
                 FROM messages m
                 JOIN users u ON u.id = CASE 
                     WHEN m.sender_id = ? THEN m.receiver_id 
                     ELSE m.sender_id 
                 END
                 WHERE m.sender_id = ? OR m.receiver_id = ?
                 GROUP BY other_user_id
                 ORDER BY last_message_time DESC`;
    
    db.all(sql, [userId, userId, userId, userId], (err, conversations) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching conversations' });
        }
        res.json(conversations);
    });
});

// Mark message as read
app.put('/api/messages/:id/read', (req, res) => {
    db.run('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating message' });
        }
        res.json({ success: true, message: 'Message marked as read' });
    });
});

// Get conversation between two users (old endpoint for compatibility)
app.get('/api/messages/:userId1/:userId2', (req, res) => {
    const { userId1, userId2 } = req.params;
    
    const sql = `SELECT m.*, 
                 s.name as sender_name, 
                 r.name as receiver_name
                 FROM messages m
                 JOIN users s ON m.sender_id = s.id
                 JOIN users r ON m.receiver_id = r.id
                 WHERE (m.sender_id = ? AND m.receiver_id = ?)
                    OR (m.sender_id = ? AND m.receiver_id = ?)
                 ORDER BY m.created_at ASC`;
    
    db.all(sql, [userId1, userId2, userId2, userId1], (err, messages) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching messages' });
        }
        
        res.json({ success: true, messages });
    });
});

// Get user's conversations
app.get('/api/conversations/:userId', (req, res) => {
    const { userId } = req.params;
    
    const sql = `SELECT DISTINCT 
                 CASE 
                     WHEN m.sender_id = ? THEN m.receiver_id 
                     ELSE m.sender_id 
                 END as other_user_id,
                 u.name as other_user_name,
                 u.user_type as other_user_type,
                 MAX(m.created_at) as last_message_time
                 FROM messages m
                 JOIN users u ON (CASE 
                     WHEN m.sender_id = ? THEN m.receiver_id 
                     ELSE m.sender_id 
                 END) = u.id
                 WHERE m.sender_id = ? OR m.receiver_id = ?
                 GROUP BY other_user_id
                 ORDER BY last_message_time DESC`;
    
    db.all(sql, [userId, userId, userId, userId], (err, conversations) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching conversations' });
        }
        
        res.json({ success: true, conversations });
    });
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
app.get('/api/users/:id', (req, res) => {
    db.get('SELECT id, name, email, phone, user_type, location, created_at FROM users WHERE id = ?', 
           [req.params.id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error fetching user' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user });
    });
});

// Update user profile
app.put('/api/users/:id', (req, res) => {
    const { name, email, phone, location } = req.body;
    
    const sql = `UPDATE users SET name = ?, email = ?, phone = ?, location = ? WHERE id = ?`;
    
    db.run(sql, [name, email, phone, location, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating user' });
        }
        
        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

// ============================================
// STATISTICS ROUTES
// ============================================

// Get dashboard stats
app.get('/api/stats/dashboard/:userId', (req, res) => {
    const { userId } = req.params;
    const { userType } = req.query;
    
    if (userType === 'farmer') {
        // Farmer stats
        const queries = [
            new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as count FROM products WHERE farmer_id = ?', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ totalProducts: row.count });
                });
            }),
            new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as count FROM orders WHERE farmer_id = ? AND status = "pending"', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ pendingOrders: row.count });
                });
            }),
            new Promise((resolve, reject) => {
                db.get('SELECT SUM(total_price) as total FROM orders WHERE farmer_id = ? AND status = "completed"', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ totalRevenue: row.total || 0 });
                });
            })
        ];
        
        Promise.all(queries)
            .then(results => {
                const stats = Object.assign({}, ...results);
                res.json({ success: true, stats });
            })
            .catch(err => {
                res.status(500).json({ success: false, message: 'Error fetching stats' });
            });
    } else {
        // Customer stats
        const queries = [
            new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as count FROM orders WHERE customer_id = ?', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ totalOrders: row.count });
                });
            }),
            new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) as count FROM orders WHERE customer_id = ? AND status = "pending"', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ pendingOrders: row.count });
                });
            }),
            new Promise((resolve, reject) => {
                db.get('SELECT SUM(total_price) as total FROM orders WHERE customer_id = ?', [userId], (err, row) => {
                    if (err) reject(err);
                    else resolve({ totalSpent: row.total || 0 });
                });
            })
        ];
        
        Promise.all(queries)
            .then(results => {
                const stats = Object.assign({}, ...results);
                res.json({ success: true, stats });
            })
            .catch(err => {
                res.status(500).json({ success: false, message: 'Error fetching stats' });
            });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🌾 Krishi Bazaar server running on http://localhost:${PORT}`);
    console.log(`📊 Database: krishi-bazaar.db`);
});
