// <script>
    // Configuration (simpler: point directly to PHP controller)
    const API_BASE_URL = '../controllers/AuthController.php';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeAuth();
    });

    function initializeAuth() {
        console.log('Auth page initialized');
        setupAuthEventListeners();
    }

    // Setup event listeners
    function setupAuthEventListeners() {
        const authTabs = document.querySelectorAll('.auth-tab');
        const authForms = document.querySelectorAll('.auth-form');
        
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                authTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                authForms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${tabName}-form`) {
                        form.classList.add('active');
                    }
                });
            });
        });
        
        const switchToRegister = document.getElementById('switch-to-register');
        if (switchToRegister) {
            switchToRegister.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('[data-tab="register"]').click();
            });
        }
        
        const switchToLogin = document.getElementById('switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector('[data-tab="login"]').click();
            });
        }
        
        const togglePasswordButtons = document.querySelectorAll('.toggle-password');
        togglePasswordButtons.forEach(button => {
            button.addEventListener('click', function() {
                const input = this.previousElementSibling;
                const icon = this.querySelector('i');
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
        
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', validatePassword);
        }
        
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        }
        
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin(this);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegistration(this);
            });
        }
    }

    // Validate password strength
    function validatePassword() {
        const password = document.getElementById('register-password').value;
        const registerBtn = document.getElementById('register-btn');
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        updateRequirementIndicator('req-length', hasMinLength);
        updateRequirementIndicator('req-uppercase', hasUppercase);
        updateRequirementIndicator('req-number', hasNumber);
        updateRequirementIndicator('req-special', hasSpecialChar);

        const confirmPassword = document.getElementById('register-confirm-password').value;
        const passwordsMatch = !confirmPassword || password === confirmPassword;
        const isValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar && passwordsMatch;
        registerBtn.disabled = !isValid;
        return isValid;
    }

    function updateRequirementIndicator(elementId, isMet) {
        const element = document.getElementById(elementId);
        if (element) {
            const icon = element.querySelector('i');
            icon.classList.toggle('requirement-met', isMet);
            icon.classList.toggle('requirement-not-met', !isMet);
        }
    }

    function validateConfirmPassword() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        if (confirmPassword && password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }
        validatePassword();
        return true;
    }

    // Handle login
    function handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('remember_me') === 'on';

        if (!email || !password) return showToast('Please fill in all fields', 'error');
        if (!validateEmail(email)) return showToast('Please enter a valid email', 'error');

        const loginBtn = document.getElementById('login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        loginUser(email, password, rememberMe)
            .then(response => {
                showToast('Login successful! Redirecting...', 'success');
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userData', JSON.stringify(response.user));
                setTimeout(() => window.location.href = 'index.php', 1500);
            })
            .catch(error => showToast(error.message, 'error'))
            .finally(() => {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            });
    }

    // Handle registration
    function handleRegistration(form) {
        const formData = new FormData(form);
        const { username, firstName, lastName, email, phone, password, confirm_password } = Object.fromEntries(formData);

        if (!username || !firstName || !lastName || !email || !password || !confirm_password)
            return showToast('Please fill in all required fields', 'error');
        if (!validateEmail(email)) return showToast('Invalid email', 'error');
        if (!validatePassword()) return showToast('Password requirements not met', 'error');
        if (!validateConfirmPassword()) return;

        const registerBtn = document.getElementById('register-btn');
        const originalText = registerBtn.textContent;
        registerBtn.textContent = 'Creating account...';
        registerBtn.disabled = true;

        registerUser(username, firstName, lastName, email, phone, password)
            .then(() => {
                showToast('Account created successfully!', 'success');
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('login-email').value = email;
                form.reset();
                resetPasswordValidation();
            })
            .catch(error => showToast(error.message, 'error'))
            .finally(() => {
                registerBtn.textContent = originalText;
                registerBtn.disabled = false;
            });
    }

    function resetPasswordValidation() {
        ['req-length', 'req-uppercase', 'req-number', 'req-special']
            .forEach(req => updateRequirementIndicator(req, false));
        document.getElementById('register-btn').disabled = true;
    }

    // API calls
    function loginUser(email, password, rememberMe) {
        return fetch(`${API_BASE_URL}?endpoint=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, remember_me: rememberMe })
        })
        .then(r => r.ok ? r.json() : r.json().then(err => { throw new Error(err.error || 'Login failed'); }))
        .then(data => { if (data.error) throw new Error(data.error); return data; });
    }

    function registerUser(username, firstName, lastName, email, phone, password) {
        return fetch(`${API_BASE_URL}?endpoint=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, firstName, lastName, email, phone, password })
        })
        .then(r => r.ok ? r.json() : r.json().then(err => { throw new Error(err.error || 'Registration failed'); }))
        .then(data => { if (data.error) throw new Error(data.error); return data; });
    }

    // Helpers
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    }

    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
            <div class="toast-content"><div class="toast-message">${message}</div></div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch(`${API_BASE_URL}?endpoint=verify`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(r => r.json())
        .then(data => {
            if (data.valid) window.location.href = 'index.php';
            else {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        })
        .catch(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        });
    }

    checkAuthStatus();
