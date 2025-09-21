<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - ShopEasy</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="../css/profile.css">
</head>
<body>
    <!-- Top Bar -->
    <div class="top-bar">
        <div class="top-bar-content">
            <div class="top-bar-text">Free shipping on orders over $50</div>
            <div class="top-bar-links">
                <a href="#">Help</a>
                <a href="#">Contact</a>
                <a href="#">Order Tracking</a>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header>
        <div class="header-content">
            <a href="index.php" class="logo">
                <i class="fas fa-shopping-bag"></i>
                ShopEasy
            </a>
            
            <div class="header-icons">
                <button class="icon-btn">
                    <i class="fas fa-user"></i>
                </button>
                <button class="icon-btn">
                    <i class="fas fa-heart"></i>
                    <span class="count" id="wishlist-count">3</span>
                </button>
                <button class="icon-btn">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="count" id="cart-count">5</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav>
        <div class="nav-container">
            <ul class="nav-menu">
                <li><a href="index.html">Home</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Best Sellers</a></li>
                <li><a href="#">Sale</a></li>
                <li><a href="#">Electronics</a></li>
                <li><a href="#">Clothing</a></li>
                <li><a href="profile.html" class="active">My Account</a></li>
            </ul>
        </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="breadcrumb">
        <div class="breadcrumb-container">
            <ul>
                <li><a href="index.html">Home</a></li>
                <li>My Account</li>
            </ul>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Profile Sidebar -->
        <div class="profile-sidebar">
            <div class="profile-header">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="User Avatar" class="profile-avatar" id="user-avatar">
                <h2 class="profile-name" id="user-name">John Doe</h2>
                <p class="profile-email" id="user-email">john.doe@example.com</p>
            </div>
            <ul class="profile-menu">
                <li class="profile-menu-item">
                    <a href="#dashboard" class="profile-menu-link active" data-section="dashboard">
                        <i class="fas fa-chart-pie"></i> Dashboard
                    </a>
                </li>
                <li class="profile-menu-item">
                    <a href="#orders" class="profile-menu-link" data-section="orders">
                        <i class="fas fa-shopping-bag"></i> Orders
                    </a>
                </li>
                <li class="profile-menu-item">
                    <a href="#addresses" class="profile-menu-link" data-section="addresses">
                        <i class="fas fa-map-marker-alt"></i> Addresses
                    </a>
                </li>
                <li class="profile-menu-item">
                    <a href="#wishlist" class="profile-menu-link" data-section="wishlist">
                        <i class="fas fa-heart"></i> Wishlist
                    </a>
                </li>
                <li class="profile-menu-item">
                    <a href="#settings" class="profile-menu-link" data-section="settings">
                        <i class="fas fa-cog"></i> Account Settings
                    </a>
                </li>
                <li class="profile-menu-item">
                    <a href="#" class="profile-menu-link" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </li>
            </ul>
        </div>

        <!-- Profile Content -->
        <div class="profile-content">
            <!-- Dashboard Section -->
            <div class="content-section" id="dashboard-section">
                <div class="content-header">
                    <h2 class="content-title">Dashboard</h2>
                    <span>Welcome back, <span id="dashboard-user-name">John</span>!</span>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-value" id="orders-count">5</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: var(--success);">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-value" id="completed-orders">3</div>
                        <div class="stat-label">Completed Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: var(--warning);">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-value" id="wishlist-items">8</div>
                        <div class="stat-label">Wishlist Items</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background-color: var(--accent);">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="stat-value" id="addresses-count">2</div>
                        <div class="stat-label">Saved Addresses</div>
                    </div>
                </div>

                <h3>Recent Orders</h3>
                <div class="orders-table-container">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="recent-orders">
                            <!-- Recent orders will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Orders Section -->
            <div class="content-section" id="orders-section" style="display: none;">
                <div class="content-header">
                    <h2 class="content-title">My Orders</h2>
                    <button class="btn btn-primary" id="refresh-orders-btn">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>

                <div class="orders-table-container">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="orders-list">
                            <!-- Orders will be loaded dynamically -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="pagination" id="orders-pagination">
                    <button class="pagination-btn" data-page="1">1</button>
                    <button class="pagination-btn" data-page="2">2</button>
                    <button class="pagination-btn" data-page="3">3</button>
                    <button class="pagination-btn" id="next-page-btn">Next <i class="fas fa-chevron-right"></i></button>
                </div>
            </div>

            <!-- Addresses Section -->
            <div class="content-section" id="addresses-section" style="display: none;">
                <div class="content-header">
                    <h2 class="content-title">My Addresses</h2>
                    <button class="btn btn-primary" id="add-address-btn">
                        <i class="fas fa-plus"></i> Add New Address
                    </button>
                </div>

                <div class="address-grid" id="addresses-list">
                    <!-- Addresses will be loaded dynamically -->
                </div>
            </div>

            <!-- Wishlist Section -->
            <div class="content-section" id="wishlist-section" style="display: none;">
                <div class="content-header">
                    <h2 class="content-title">My Wishlist</h2>
                    <button class="btn btn-primary" id="refresh-wishlist-btn">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>

                <div class="products-container" id="wishlist-items-container">
                    <!-- Wishlist items will be loaded dynamically -->
                </div>

            <!-- Account Settings Section -->
            <div class="content-section" id="settings-section" style="display: none;">
                <div class="content-header">
                    <h2 class="content-title">Account Settings</h2>
                </div>

                <form id="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="first-name">First Name</label>
                            <input type="text" id="first-name" name="first_name" required>
                        </div>
                        <div class="form-group">
                            <label for="last-name">Last Name</label>
                            <input type="text" id="last-name" name="last_name" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    <div class="form-group">
                        <label for="current-password">Current Password</label>
                        <input type="password" id="current-password" name="current_password">
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" name="new_password">
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm New Password</label>
                        <input type="password" id="confirm-password" name="confirm_password">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Address Modal -->
    <div class="modal" id="address-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="address-modal-title">Add New Address</h3>
                <button class="close-btn">&times;</button>
            </div>
            <form id="address-form">
                <input type="hidden" id="address-id" name="id" value="">
                <div class="form-group">
                    <label for="address-type">Address Type</label>
                    <select id="address-type" name="type" required>
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="full-name">Full Name</label>
                    <input type="text" id="full-name" name="full_name" required>
                </div>
                <div class="form-group">
                    <label for="address-line1">Address Line 1</label>
                    <input type="text" id="address-line1" name="address_line1" required>
                </div>
                <div class="form-group">
                    <label for="address-line2">Address Line 2 (Optional)</label>
                    <input type="text" id="address-line2" name="address_line2">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="city">City</label>
                        <input type="text" id="city" name="city" required>
                    </div>
                    <div class="form-group">
                        <label for="state">State</label>
                        <input type="text" id="state" name="state" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="zip-code">ZIP Code</label>
                        <input type="text" id="zip-code" name="zip_code" required>
                    </div>
                    <div class="form-group">
                        <label for="country">Country</label>
                        <select id="country" name="country" required>
                            <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" required>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="default-address" name="is_default"> Set as default address
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" id="cancel-address-btn">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Address</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Notification Toast Container -->
    <div class="toast-container" id="toast-container">
        <!-- Toasts will be added here dynamically -->
    </div>
    <!-- JavaScript Files -->
    <script src="../scripts/profile.js"></script>
</body>
</html>