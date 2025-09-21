<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - ShopEasy</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="../css/login.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-header">
            <h1>Welcome to ShopEasy</h1>
            <p>Sign in or create an account to continue</p>
        </div>
        
        <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Login</button>
            <button class="auth-tab" data-tab="register">Register</button>
        </div>

        <div class="auth-content">
            <!-- Login Form -->
            <form class="auth-form active" id="login-form">
                <div class="form-group">
                    <label for="login-email">Email Address</label>
                    <input type="email" id="login-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <div class="password-field">
                        <input type="password" id="login-password" name="password" required>
                        <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="form-options">
                    <div class="remember-me">
                        <input type="checkbox" id="remember-me" name="remember_me">
                        <label for="remember-me">Remember me</label>
                    </div>
                    <a href="#" class="forgot-password">Forgot Password?</a>
                </div>
                <button type="submit" class="btn btn-primary" id="login-btn">Login</button>
                <div class="form-footer">
                    Don't have an account? <a href="#" id="switch-to-register">Register now</a>
                </div>
            </form>

            <!-- Register Form -->
            <form class="auth-form" id="register-form">
                <div class="form-group">
                    <label for="register-username">Username</label>
                    <input type="text" id="register-username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="register-first-name">First Name</label>
                    <input type="text" id="register-first-name" name="firstName" required>
                </div>
                <div class="form-group">
                    <label for="register-last-name">Last Name</label>
                    <input type="text" id="register-last-name" name="lastName" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email Address</label>
                    <input type="email" id="register-email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="register-phone">Phone Number</label>
                    <input type="tel" id="register-phone" name="phone">
                </div>
                <div class="form-group">
                    <label for="register-password">Password</label>
                    <div class="password-field">
                        <input type="password" id="register-password" name="password" required>
                        <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <div class="password-requirements">
                        <p>Password must meet the following requirements:</p>
                        <ul>
                            <li id="req-length"><i class="fas fa-circle"></i> At least 8 characters</li>
                            <li id="req-uppercase"><i class="fas fa-circle"></i> One uppercase letter</li>
                            <li id="req-number"><i class="fas fa-circle"></i> One number</li>
                            <li id="req-special"><i class="fas fa-circle"></i> One special character</li>
                        </ul>
                    </div>
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Confirm Password</label>
                    <div class="password-field">
                        <input type="password" id="register-confirm-password" name="confirm_password" required>
                        <button type="button" class="toggle-password" aria-label="Toggle password visibility">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" id="register-btn" disabled>Create Account</button>
                <div class="form-footer">
                    Already have an account? <a href="#" id="switch-to-login">Login now</a>
                </div>
            </form>
        </div>
    </div>

    <!-- Notification Toast Container -->
    <div class="toast-container" id="toast-container">
        <!-- Toasts will be added here dynamically -->
    </div>

    <!-- <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> -->
    <script src="../scripts/login.js"></script>
</body>
</html>