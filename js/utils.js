// Authentication utilities
const Auth = {
    // Save user to session
    saveUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Get current user
    getCurrentUser() {
        const userData = sessionStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Logout user
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    },

    // Check if user is a farmer
    isFarmer() {
        const user = this.getCurrentUser();
        return user && user.type === 'farmer';
    },

    // Check if user is a customer
    isCustomer() {
        const user = this.getCurrentUser();
        return user && user.type === 'customer';
    }
};

// UI Utilities
const UI = {
    // Show loading spinner
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary-green);"></i>
                    <p style="margin-top: 20px; color: var(--dark-gray);">Loading...</p>
                </div>
            `;
        }
    },

    // Show success message
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },

    // Show error message
    showError(message, duration = 3000) {
        this.showNotification(message, 'error', duration);
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        const existing = document.querySelector('.notification-toast');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 25px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .notification-toast i {
                    font-size: 1.5rem;
                }
                .notification-success {
                    border-left: 4px solid #4CAF50;
                }
                .notification-success i {
                    color: #4CAF50;
                }
                .notification-error {
                    border-left: 4px solid #f44336;
                }
                .notification-error i {
                    color: #f44336;
                }
                .notification-info {
                    border-left: 4px solid #2196F3;
                }
                .notification-info i {
                    color: #2196F3;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    // Update user info in UI
    updateUserInfo(user) {
        const avatarElements = document.querySelectorAll('.user-avatar');
        const usernameElements = document.querySelectorAll('#sidebar-username, #top-username');
        
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        avatarElements.forEach(el => {
            el.textContent = initials;
        });
        
        usernameElements.forEach(el => {
            if (el) el.textContent = user.name;
        });
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Format currency
    formatCurrency(amount) {
        return `NPR ${Number(amount).toLocaleString()}`;
    },

    // Confirm dialog
    confirm(message, callback) {
        if (window.confirm(message)) {
            callback();
        }
    }
};

// Navigation utilities
const Navigation = {
    navigateToPage(page) {
        const currentUser = Auth.getCurrentUser();
        const userType = currentUser?.type || 'customer';
        
        const pageMap = {
            'dashboard': userType === 'farmer' ? 'farmer-dashboard.html' : 'customer-dashboard.html',
            'products': 'product-listing.html',
            'marketplace': 'mp.html',
            'messages': 'messaging.html',
            'map': 'nepal-map.html',
            'profile': 'profile.html',
            'notifications': 'Customer-notifications.html'
        };
        
        const url = pageMap[page];
        if (url) {
            window.location.href = url;
        }
    }
};

// Form validation utilities
const Validation = {
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    validatePassword(password) {
        return password.length >= 6;
    },

    validateRequired(value) {
        return value && value.trim() !== '';
    }
};

// Backward compatibility - Utils is an alias for Auth
const Utils = Auth;
