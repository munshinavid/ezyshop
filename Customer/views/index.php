<script>
    document.addEventListener("DOMContentLoaded", function() {
        const userData = JSON.parse(localStorage.getItem("userData"));

        if (!userData) {
            // Not logged in -> redirect to login page
            window.location.href = "login.php";
            return;
        }

        // Show greeting
        const greeting = document.getElementById("user-greeting");
        if (greeting) {
            greeting.textContent = `Hi, ${userData.username || userData.firstName}`;
        }
    });
</script>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopEasy - Modern Online Shopping</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="../css/index.css">
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
            <a href="#" class="logo">
                <i class="fas fa-shopping-bag"></i>
                ShopEasy
            </a>
            
            <div class="search-container">
                <div class="category-dropdown">
                    <button class="category-toggle">
                        All Categories <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="category-menu">
                        <a href="#">Electronics</a>
                        <a href="#">Clothing</a>
                        <a href="#">Home & Kitchen</a>
                        <a href="#">Books</a>
                        <a href="#">Sports</a>
                        <a href="#">Beauty</a>
                    </div>
                </div>
                <div class="search-bar">
                    <input type="text" placeholder="Search for products...">
                    <button class="search-btn">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            
            <div class="header-icons" >
                <button class="icon-btn" onclick="window.location.href='profile.php'">
                    <i class="fas fa-user"></i>
                    <span id="user-greeting"></span> <!-- 👈 Added -->
                </button>
                <button class="icon-btn" onclick="window.location.href='wishlist.php'">
                    <i class="fas fa-heart"></i>
                    <span class="count" id="wishlist-count">3</span>
                </button>
                <button class="icon-btn" onclick="window.location.href='cart.php'">
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
                <li><a href="#" class="active">Home</a></li>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Best Sellers</a></li>
                <li><a href="#">Sale</a></li>
                <li><a href="#">Electronics</a></li>
                <li><a href="#">Clothing</a></li>
                <li><a href="#">Home & Kitchen</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Banner -->
    <div class="hero-banner">
        <div class="banner-slide active" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');">
            <div class="banner-content">
                <h1>Summer Sale Up To 50% Off</h1>
                <p>Discover the latest trends and get the best deals on thousands of products. Free shipping on orders over $50.</p>
                <div>
                    <button class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i> Shop Now
                    </button>
                    <button class="btn btn-outline">
                        <i class="fas fa-eye"></i> View Collection
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Filter Row -->
    <div class="filter-row">
        <div class="filter-container">
            <div class="filter-tabs">
                <div class="filter-tab active" data-filter="all">All Products</div>
                <div class="filter-tab" data-filter="new">New Arrivals</div>
                <div class="filter-tab" data-filter="bestseller">Best Sellers</div>
                <div class="filter-tab" data-filter="sale">On Sale</div>
            </div>
            <div class="filter-dropdowns">
                <div class="filter-dropdown">
                    <div class="filter-dropdown-toggle">
                        <i class="fas fa-filter"></i>
                        Filter
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="filter-dropdown-menu">
                        <div class="filter-option" data-filter="price-low">Price: Low to High</div>
                        <div class="filter-option" data-filter="price-high">Price: High to Low</div>
                        <div class="filter-option" data-filter="stock">In Stock</div>
                        <div class="filter-option" data-filter="rating">Highest Rated</div>
                    </div>
                </div>
                <div class="filter-dropdown">
                    <div class="filter-dropdown-toggle">
                        <i class="fas fa-sort-amount-down"></i>
                        Sort By
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="filter-dropdown-menu">
                        <div class="filter-option" data-sort="newest">Newest First</div>
                        <div class="filter-option" data-sort="popular">Most Popular</div>
                        <div class="filter-option" data-sort="name">Name A-Z</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Products Section -->
    <section class="section">
        <div class="products-container">
            <div class="products-grid" id="products-container">
                <!-- Products will be loaded dynamically -->
            </div>
            
            <!-- Pagination -->
            <div class="pagination" id="pagination">
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn">2</button>
                <button class="pagination-btn">3</button>
                <button class="pagination-btn">Next <i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter">
        <h2>Subscribe to Our Newsletter</h2>
        <p>Get the latest updates on new products, special offers, and sales</p>
        <form class="newsletter-form">
            <input type="email" placeholder="Enter your email address">
            <button type="submit">Subscribe</button>
        </form>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <div class="footer-column">
                <h3>ShopEasy</h3>
                <p>Your one-stop destination for all your shopping needs. Quality products at affordable prices.</p>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-pinterest"></i></a>
                </div>
            </div>
            <div class="footer-column">
                <h3>Shop</h3>
                <ul>
                    <li><a href="#">Electronics</a></li>
                    <li><a href="#">Clothing</a></li>
                    <li><a href="#">Home & Kitchen</a></li>
                    <li><a href="#">Books</a></li>
                    <li><a href="#">Sports</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h3>Customer Service</h3>
                <ul>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">FAQs</a></li>
                    <li><a href="#">Shipping & Returns</a></li>
                    <li><a href="#">Track Order</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h3>Contact Info</h3>
                <ul>
                    <li><i class="fas fa-map-marker-alt"></i> 123 Commerce St, City, Country</li>
                    <li><i class="fas fa-phone"></i> +1 234 567 8900</li>
                    <li><i class="fas fa-envelope"></i> support@shopeasy.com</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2023 ShopEasy. All rights reserved.</p>
        </div>
    </footer>

    <!-- Notification Toast Container -->
    <div class="toast-container" id="toast-container">
        <!-- Toasts will be added here dynamically -->
    </div>

    <!-- JavaScript Files -->
    <script src="../scripts/home.js"></script>
</body>
</html>