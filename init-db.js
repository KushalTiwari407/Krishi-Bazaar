const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create database
const db = new sqlite3.Database('./krishi-bazaar.db', (err) => {
    if (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    }
    console.log('📊 Connected to SQLite database');
});

// Create tables
db.serialize(async () => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        user_type TEXT NOT NULL CHECK(user_type IN ('farmer', 'customer')),
        location TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('✅ Users table created');
    });

    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farmer_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        variety TEXT,
        stock REAL NOT NULL,
        unit TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('✅ Products table created');
    });

    // Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        farmer_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        total_price REAL NOT NULL,
        delivery_method TEXT NOT NULL,
        delivery_date TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('Error creating orders table:', err);
        else console.log('✅ Orders table created');
    });

    // Messages table
    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('Error creating messages table:', err);
        else console.log('✅ Messages table created');
    });

    // Insert sample data
    setTimeout(async () => {
        console.log('\n📝 Inserting sample data...\n');
        
        // Sample users
        const users = [
            { name: 'Ram Shrestha', email: 'ram@farmer.com', phone: '9841234567', password: 'farmer123', type: 'farmer', location: 'Kathmandu' },
            { name: 'Sita Kumari', email: 'sita@farmer.com', phone: '9841234568', password: 'farmer123', type: 'farmer', location: 'Pokhara' },
            { name: 'Hari Prasad', email: 'hari@farmer.com', phone: '9841234569', password: 'farmer123', type: 'farmer', location: 'Chitwan' },
            { name: 'Bimal Karki', email: 'bimal@farmer.com', phone: '9841234570', password: 'farmer123', type: 'farmer', location: 'Biratnagar' },
            { name: 'Gopal Yadav', email: 'gopal@farmer.com', phone: '9841234571', password: 'farmer123', type: 'farmer', location: 'Kathmandu' },
            { name: 'Sunita Gurung', email: 'sunita@farmer.com', phone: '9841234572', password: 'farmer123', type: 'farmer', location: 'Pokhara' },
            { name: 'Rajesh Kumar', email: 'rajesh@customer.com', phone: '9851234567', password: 'customer123', type: 'customer', location: 'Kathmandu' },
            { name: 'Anita Sharma', email: 'anita@customer.com', phone: '9851234568', password: 'customer123', type: 'customer', location: 'Lalitpur' }
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            db.run('INSERT INTO users (name, email, phone, password, user_type, location) VALUES (?, ?, ?, ?, ?, ?)',
                [user.name, user.email, user.phone, hashedPassword, user.type, user.location],
                function(err) {
                    if (err) console.error(`Error inserting user ${user.name}:`, err.message);
                    else console.log(`👤 Created user: ${user.name} (${user.type})`);
                });
        }

        // Sample products
        setTimeout(() => {
            const products = [
                { farmerId: 1, name: 'Organic Tomatoes', category: 'vegetables', variety: 'Hybrid', stock: 150, unit: 'kg', price: 80, description: 'Fresh organic tomatoes grown without chemical fertilizers.' },
                { farmerId: 1, name: 'Cauliflower', category: 'vegetables', variety: 'Snowball', stock: 75, unit: 'kg', price: 60, description: 'Fresh white cauliflower, perfect for curries.' },
                { farmerId: 1, name: 'Green Peas', category: 'vegetables', variety: 'Sweet Green', stock: 25, unit: 'kg', price: 120, description: 'Sweet green peas, freshly harvested.' },
                { farmerId: 2, name: 'Mangoes', category: 'fruits', variety: 'Langra', stock: 200, unit: 'kg', price: 150, description: 'Sweet and juicy Langra mangoes from Pokhara.' },
                { farmerId: 2, name: 'Oranges', category: 'fruits', variety: 'Mandarin', stock: 120, unit: 'kg', price: 100, description: 'Fresh mandarin oranges, rich in vitamin C.' },
                { farmerId: 3, name: 'Rice', category: 'grains', variety: 'Basmati', stock: 500, unit: 'kg', price: 180, description: 'Premium quality basmati rice from Chitwan.' },
                { farmerId: 3, name: 'Wheat', category: 'grains', variety: 'Local', stock: 300, unit: 'kg', price: 90, description: 'High-quality wheat grains for flour.' },
                { farmerId: 4, name: 'Ginger', category: 'spices', variety: 'Local', stock: 80, unit: 'kg', price: 250, description: 'Fresh organic ginger with strong aroma.' },
                { farmerId: 4, name: 'Turmeric', category: 'spices', variety: 'Local', stock: 60, unit: 'kg', price: 300, description: 'Fresh turmeric with medicinal properties.' },
                { farmerId: 5, name: 'Milk', category: 'dairy', variety: 'Fresh', stock: 50, unit: 'liter', price: 90, description: 'Fresh cow milk from local farms.' },
                { farmerId: 6, name: 'Potatoes', category: 'vegetables', variety: 'Red', stock: 400, unit: 'kg', price: 50, description: 'Fresh red potatoes from Pokhara.' }
            ];

            products.forEach(product => {
                db.run('INSERT INTO products (farmer_id, name, category, variety, stock, unit, price, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [product.farmerId, product.name, product.category, product.variety, product.stock, product.unit, product.price, product.description],
                    function(err) {
                        if (err) console.error(`Error inserting product ${product.name}:`, err.message);
                        else console.log(`🌾 Created product: ${product.name}`);
                    });
            });

            console.log('\n✅ Database initialization complete!');
            console.log('\n📋 Sample Login Credentials:');
            console.log('   Farmer: ram@farmer.com / farmer123');
            console.log('   Customer: rajesh@customer.com / customer123');
            console.log('\n');
            
            setTimeout(() => {
                db.close();
                process.exit(0);
            }, 1000);
        }, 1000);
    }, 1000);
});
