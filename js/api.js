// API Configuration
const API_URL = 'http://localhost:3000/api';

// API Client with organized structure
const API = {
    // Authentication
    auth: {
        async register(userData) {
            try {
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                return await response.json();
            } catch (error) {
                console.error('Register error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async login(email, password) {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                return await response.json();
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async getUsers() {
            try {
                const response = await fetch(`${API_URL}/auth/users`);
                return await response.json();
            } catch (error) {
                console.error('Get users error:', error);
                throw error;
            }
        },

        async getUser(id) {
            try {
                const response = await fetch(`${API_URL}/auth/user/${id}`);
                return await response.json();
            } catch (error) {
                console.error('Get user error:', error);
                throw error;
            }
        },

        async updateUser(id, userData) {
            try {
                const response = await fetch(`${API_URL}/auth/user/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userData)
                });
                return await response.json();
            } catch (error) {
                console.error('Update user error:', error);
                return { success: false, message: 'Network error' };
            }
        }
    },

    // Products
    products: {
        async getAll(filters = {}) {
            try {
                const params = new URLSearchParams(filters);
                const response = await fetch(`${API_URL}/products?${params}`);
                return await response.json();
            } catch (error) {
                console.error('Get products error:', error);
                throw error;
            }
        },

        async getById(id) {
            try {
                const response = await fetch(`${API_URL}/products/${id}`);
                return await response.json();
            } catch (error) {
                console.error('Get product error:', error);
                throw error;
            }
        },

        async getByFarmer(farmerId) {
            try {
                const response = await fetch(`${API_URL}/products/farmer/${farmerId}`);
                return await response.json();
            } catch (error) {
                console.error('Get farmer products error:', error);
                throw error;
            }
        },

        async create(productData) {
            try {
                const response = await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productData)
                });
                return await response.json();
            } catch (error) {
                console.error('Create product error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async update(id, productData) {
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productData)
                });
                return await response.json();
            } catch (error) {
                console.error('Update product error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async delete(id) {
            try {
                const response = await fetch(`${API_URL}/products/${id}`, {
                    method: 'DELETE'
                });
                return await response.json();
            } catch (error) {
                console.error('Delete product error:', error);
                return { success: false, message: 'Network error' };
            }
        }
    },

    // Orders
    orders: {
        async getAll() {
            try {
                const response = await fetch(`${API_URL}/orders`);
                return await response.json();
            } catch (error) {
                console.error('Get all orders error:', error);
                throw error;
            }
        },

        async getById(id) {
            try {
                const response = await fetch(`${API_URL}/orders/${id}`);
                return await response.json();
            } catch (error) {
                console.error('Get order error:', error);
                throw error;
            }
        },

        async create(orderData) {
            try {
                const response = await fetch(`${API_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });
                return await response.json();
            } catch (error) {
                console.error('Create order error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async getByUser(userId, userType) {
            try {
                const response = await fetch(`${API_URL}/orders/user/${userId}?userType=${userType}`);
                return await response.json();
            } catch (error) {
                console.error('Get user orders error:', error);
                throw error;
            }
        },

        async getByCustomer(customerId) {
            try {
                const response = await fetch(`${API_URL}/orders/customer/${customerId}`);
                return await response.json();
            } catch (error) {
                console.error('Get customer orders error:', error);
                throw error;
            }
        },

        async getByFarmer(farmerId) {
            try {
                const response = await fetch(`${API_URL}/orders/farmer/${farmerId}`);
                return await response.json();
            } catch (error) {
                console.error('Get farmer orders error:', error);
                throw error;
            }
        },

        async updateStatus(orderId, status) {
            try {
                const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status })
                });
                return await response.json();
            } catch (error) {
                console.error('Update order status error:', error);
                return { success: false, message: 'Network error' };
            }
        }
    },

    // Messages
    messages: {
        async send(messageData) {
            try {
                const response = await fetch(`${API_URL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageData)
                });
                return await response.json();
            } catch (error) {
                console.error('Send message error:', error);
                return { success: false, message: 'Network error' };
            }
        },

        async getConversation(userId1, userId2) {
            try {
                const response = await fetch(`${API_URL}/messages/conversation/${userId1}/${userId2}`);
                return await response.json();
            } catch (error) {
                console.error('Get conversation error:', error);
                throw error;
            }
        },

        async getUserConversations(userId) {
            try {
                const response = await fetch(`${API_URL}/messages/user/${userId}`);
                return await response.json();
            } catch (error) {
                console.error('Get conversations error:', error);
                throw error;
            }
        },

        async markAsRead(messageId) {
            try {
                const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
                    method: 'PUT'
                });
                return await response.json();
            } catch (error) {
                console.error('Mark as read error:', error);
                return { success: false, message: 'Network error' };
            }
        }
    },

    // Statistics
    stats: {
        async getDashboard(userId) {
            try {
                const response = await fetch(`${API_URL}/stats/dashboard/${userId}`);
                return await response.json();
            } catch (error) {
                console.error('Get dashboard stats error:', error);
                throw error;
            }
        }
    }
};
