// this is Customer/scripts/auth-utils.js
class AuthManager {
    constructor() {
        this.apiBaseUrl = '../controllers/AuthController.php';
        this.authToken = localStorage.getItem('authToken');
        this.userData = this.getUserData();
    }

    // Get user data from localStorage
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.authToken && this.userData;
    }

    // Get current user info
    getCurrentUser() {
        return this.userData;
    }

    // Get auth token
    getToken() {
        return this.authToken;
    }

    // Verify token with server
    async verifyToken() {
        if (!this.authToken) throw new Error('No auth token found');

        try {
            const response = await fetch(`${this.apiBaseUrl}?endpoint=verify`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + this.authToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Token verification failed');
            }

            const data = await response.json();
            if (data.valid && data.user) {
                this.userData = data.user;
                localStorage.setItem('userData', JSON.stringify(data.user));
                return data.user;
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            console.error('Token verification error:', error);
            this.clearAuth();
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            if (this.authToken) {
                await fetch(`${this.apiBaseUrl}?endpoint=logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + this.authToken,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            window.location.href = 'login.html';
        }
    }

    // Login
    async login(email, password) {
        const response = await fetch(`${this.apiBaseUrl}?endpoint=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return await response.json();
    }

    // Register
    async register(data) {
        const response = await fetch(`${this.apiBaseUrl}?endpoint=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    // Clear auth info
    clearAuth() {
        this.authToken = null;
        this.userData = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    // Redirect to login if not authenticated
    requireAuth(redirectUrl = null) {
        if (!this.isAuthenticated()) {
            const loginUrl = redirectUrl ?
                `login.html?redirect=${encodeURIComponent(redirectUrl)}` :
                'login.html';
            window.location.href = loginUrl;
            return false;
        }
        return true;
    }

    // Check role
    hasRole(role) {
        return this.userData && this.userData.role === role;
    }

    // Authenticated API request helper
    async apiRequest(url, options = {}) {
        if (!this.authToken) throw new Error('Not authenticated');

        const config = {
            ...options,
            headers: {
                'Authorization': 'Bearer ' + this.authToken,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
            this.clearAuth();
            window.location.href = 'login.html';
            throw new Error('Session expired');
        }

        return response;
    }
}

// Global instance
const authManager = new AuthManager();

// Utility functions
function isLoggedIn() { return authManager.isAuthenticated(); }
function getCurrentUser() { return authManager.getCurrentUser(); }
function getAuthToken() { return authManager.getToken(); }
function requireLogin(redirectUrl = null) { return authManager.requireAuth(redirectUrl); }
function logout() { return authManager.logout(); }
function hasRole(role) { return authManager.hasRole(role); }

// DOM helpers
function initializeAuth() {
    const isLoginPage = window.location.pathname.includes('login.html');

    if (!isLoginPage && !isLoggedIn()) {
        const currentUrl = window.location.href;
        window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
        return false;
    }

    if (isLoggedIn()) {
        authManager.verifyToken().catch(error => {
            console.error('Token verification failed:', error);
            if (!isLoginPage) window.location.href = 'login.html';
        });

        setInterval(() => {
            authManager.verifyToken().catch(error => {
                console.error('Token verification failed:', error);
                if (!isLoginPage) window.location.href = 'login.html';
            });
        }, 15 * 60 * 1000);
    }

    return true;
}

function updateUserInterface() {
    const user = getCurrentUser();
    if (!user) return;

    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.firstName + ' ' + (user.lastName || '') || user.username);
    document.querySelectorAll('.user-avatar').forEach(el => { if (user.avatar) el.src = user.avatar; });
    document.querySelectorAll('.user-email').forEach(el => el.textContent = user.email);

    if (hasRole('Admin')) document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    if (hasRole('Customer')) document.querySelectorAll('.customer-only').forEach(el => el.style.display = 'block');
}

// Logout buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.logout-btn, [data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) logout();
        });
    });

    if (isLoggedIn()) updateUserInterface();
});

document.addEventListener('DOMContentLoaded', initializeAuth);

// Redirect after login
function handleLoginRedirect() {
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
    if (redirectUrl) window.location.href = decodeURIComponent(redirectUrl);
    else window.location.href = 'index.html';
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { authManager, isLoggedIn, getCurrentUser, getAuthToken, requireLogin, logout, hasRole, initializeAuth, updateUserInterface, handleLoginRedirect };
}
