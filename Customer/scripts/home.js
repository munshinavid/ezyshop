// home.js - Fixed Homepage Frontend JavaScript with RESTful API calls

// Configuration
const userData = JSON.parse(localStorage.getItem("userData"));
const API_BASE_URL = '../controllers/HomeController.php'; // Base API endpoint
const CURRENT_USER_ID = userData ? userData.id : null;

initializeEcommerce();

// State management
let currentPage = 1;
let currentFilter = 'all';
let currentSort = 'newest';
let currentCategory = '';
let currentSearch = '';
let isLoading = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// RESTful API call helper function
async function apiCall(endpoint, options = {}) {
    // Construct proper URL based on endpoint
    let url;
    if (endpoint.startsWith('http')) {
        url = endpoint;
    } else {
        url = `${API_BASE_URL}/${endpoint}`;
    }
    
    console.log('API Call to:', url);
    
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        showToast('Network error. Please try again.', 'error');
        throw error;
    }
}

// Enhanced error handling for API calls
async function safeApiCall(endpoint, options = {}) {
    try {
        return await apiCall(endpoint, options);
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        
        // Show user-friendly error messages
        if (error.message.includes('404')) {
            showToast('Resource not found', 'error');
        } else if (error.message.includes('500')) {
            showToast('Server error. Please try again later.', 'error');
        } else if (error.message.includes('Failed to fetch')) {
            showToast('Network error. Please check your connection.', 'error');
        } else {
            showToast('Something went wrong. Please try again.', 'error');
        }
        
        throw error;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    
    // Create toast container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add basic styles if not already present
    if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                margin-bottom: 10px;
                padding: 16px;
                display: flex;
                align-items: center;
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid;
            }
            .toast-success { border-left-color: #10b981; }
            .toast-error { border-left-color: #ef4444; }
            .toast-warning { border-left-color: #f59e0b; }
            .toast-icon { margin-right: 12px; color: inherit; }
            .toast-success .toast-icon { color: #10b981; }
            .toast-error .toast-icon { color: #ef4444; }
            .toast-warning .toast-icon { color: #f59e0b; }
            .toast-content { flex: 1; }
            .toast-message { margin: 0; font-size: 14px; }
            .toast-close {
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                margin-left: 8px;
            }
            .toast-close:hover { color: #374151; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Update cart count (RESTful)
async function updateCartCount() {
    if (!CURRENT_USER_ID) return;
    
    try {
        const response = await apiCall(`customers/${CURRENT_USER_ID}/cart/count`);
        const cartCount = document.getElementById('cart-count');
        if (cartCount && response.success) {
            cartCount.textContent = response.cart_count > 0 ? response.cart_count : '';
            cartCount.style.display = response.cart_count > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Failed to load cart count:', error);
    }
}

// Update wishlist count (RESTful)
async function updateWishlistCount() {
    if (!CURRENT_USER_ID) return;
    
    try {
        const response = await apiCall(`users/${CURRENT_USER_ID}/wishlist/count`);
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount && response.success) {
            wishlistCount.textContent = response.wishlist_count > 0 ? response.wishlist_count : '';
            wishlistCount.style.display = response.wishlist_count > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Failed to load wishlist count:', error);
    }
}

// Update cart count from API response
function updateCartCountFromResponse(count) {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count > 0 ? count : '';
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Update wishlist count from API response
function updateWishlistCountFromResponse(count) {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = count > 0 ? count : '';
        wishlistCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Load categories from backend (RESTful)
async function loadCategories() {
    try {
        const data = await apiCall('categories');
        if (data.success) {
            renderCategories(data.categories);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Render categories in dropdown
function renderCategories(categories) {
    const categoryMenu = document.querySelector('.category-menu');
    if (!categoryMenu) return;
    
    let categoriesHTML = '<a href="#" class="category-item" data-category="">All Categories</a>';
    
    categories.forEach(category => {
        categoriesHTML += `<a href="#" class="category-item" data-category="${category.category_name}">${category.category_name}</a>`;
    });
    
    categoryMenu.innerHTML = categoriesHTML;
    
    // Add event listeners to category items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            filterByCategory(category);
            categoryMenu.style.display = 'none';
        });
    });
}

// Load products from backend (RESTful with query parameters)
async function loadProducts(page = 1, filter = 'all', sort = 'newest', category = '', search = '') {
    if (isLoading) return;
    
    isLoading = true;
    
    // Show loading state
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        productsContainer.innerHTML = '<div class="loading">Loading products...</div>';
    }
    
    try {
        // Build query parameters for RESTful endpoint
        const params = new URLSearchParams({
            page: page,
            limit: 8,
            filter: filter,
            sort: sort
        });
        
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        
        const data = await apiCall(`products?${params.toString()}`);
        
        if (data.success) {
            // Update state
            currentPage = page;
            currentFilter = filter;
            currentSort = sort;
            currentCategory = category;
            currentSearch = search;
            
            renderProducts(data.products);
            updatePagination(data.pagination.current_page, data.pagination.total_pages);
        }
        
    } catch (error) {
        console.error('Failed to load products:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="error-state">Failed to load products. Please refresh the page.</div>';
        }
    } finally {
        isLoading = false;
    }
}

// Get star rating HTML
function getStarRating(rating) {
    let starsHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// Render products - Enhanced with wishlist tracking
function renderProducts(products) {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="empty-state">No products found. Try adjusting your filters.</div>';
        return;
    }
    
    let productsHTML = '';
    
    products.forEach(product => {
        const originalPrice = parseFloat(product.original_price);
        const currentPrice = parseFloat(product.price);
        const discount = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
        
        productsHTML += `
            <div class="product-card" data-product-id="${product.product_id}">
                ${product.badge ? `<div class="product-badge badge-${product.badge}">${product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}</div>` : ''}
                <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-category">${product.category_name || 'Uncategorized'}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        <div class="stars">
                            ${getStarRating(parseFloat(product.rating))}
                        </div>
                        <span class="rating-count">(${product.review_count})</span>
                    </div>
                    <div class="product-price">
                        <span class="current-price">$${currentPrice.toFixed(2)}</span>
                        ${originalPrice > currentPrice ? `<span class="original-price">$${originalPrice.toFixed(2)}</span>` : ''}
                        ${discount > 0 ? `<span class="discount">${discount}% off</span>` : ''}
                    </div>
                    <div class="product-stock ${product.in_stock ? '' : 'out-of-stock'}">
                        ${product.in_stock ? `${product.stock} in stock` : 'Out of stock'}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart ${!product.in_stock ? 'disabled' : ''}" 
                                onclick="addToCart(${product.product_id})" 
                                ${!product.in_stock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> 
                            ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                        <button class="btn-wishlist" onclick="addToWishlist(${product.product_id})" 
                                data-product-id="${product.product_id}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = productsHTML;
    
    // Load wishlist status for all products
    loadWishlistStatus();
}

// Load and update wishlist status for displayed products (RESTful)
async function loadWishlistStatus() {
    if (!CURRENT_USER_ID) return;
    
    try {
        const response = await apiCall(`users/${CURRENT_USER_ID}/wishlist`);
        if (!response.success) return;
        
        const wishlistItems = response.wishlist_items || [];
        
        // Create a set of wishlist product IDs for quick lookup
        const wishlistProductIds = new Set(wishlistItems.map(item => item.product_id.toString()));
        
        // Update wishlist buttons
        const wishlistBtns = document.querySelectorAll('.btn-wishlist');
        wishlistBtns.forEach(btn => {
            const productId = btn.dataset.productId;
            if (wishlistProductIds.has(productId)) {
                btn.classList.add('in-wishlist');
                btn.innerHTML = '<i class="fas fa-heart" style="color: #e74c3c;"></i>';
            } else {
                btn.classList.remove('in-wishlist');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
        });
    } catch (error) {
        console.error('Failed to load wishlist status:', error);
    }
}

// Update pagination
function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> Prev</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadPage(${i})">${i}</button>`;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="loadPage(${currentPage + 1})">Next <i class="fas fa-chevron-right"></i></button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
}

// Add to cart (RESTful)
async function addToCart(productId) {
    if (!CURRENT_USER_ID) {
        showToast('Please login to add items to cart', 'error');
        return;
    }
    
    try {
        const response = await apiCall(`customers/${CURRENT_USER_ID}/cart`, {
            method: 'POST',
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });
        
        if (response.success) {
            updateCartCountFromResponse(response.cart_count);
            showToast(response.message, 'success');
        } else {
            showToast(response.error || 'Failed to add to cart', 'error');
        }
    } catch (error) {
        console.error('Failed to add to cart:', error);
        showToast('Failed to add to cart', 'error');
    }
}

// Add to wishlist (RESTful)
async function addToWishlist(productId) {
    if (!CURRENT_USER_ID) {
        showToast('Please login to add items to wishlist', 'error');
        return;
    }
    
    try {
        const btn = document.querySelector(`.btn-wishlist[data-product-id="${productId}"]`);
        const isInWishlist = btn && btn.classList.contains('in-wishlist');
        
        if (isInWishlist) {
            // Remove from wishlist - DELETE /users/{userId}/wishlist/{productId}
            const response = await apiCall(`users/${CURRENT_USER_ID}/wishlist/${productId}`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                updateWishlistCountFromResponse(response.wishlist_count);
                if (btn) {
                    btn.classList.remove('in-wishlist');
                    btn.innerHTML = '<i class="fas fa-heart"></i>';
                }
                showToast(response.message, 'success');
            } else {
                showToast(response.error || 'Failed to remove from wishlist', 'error');
            }
        } else {
            // Add to wishlist - POST /users/{userId}/wishlist
            const response = await apiCall(`users/${CURRENT_USER_ID}/wishlist`, {
                method: 'POST',
                body: JSON.stringify({
                    product_id: productId
                })
            });
            
            if (response.success) {
                updateWishlistCountFromResponse(response.wishlist_count);
                if (btn) {
                    btn.classList.add('in-wishlist');
                    btn.innerHTML = '<i class="fas fa-heart" style="color: #e74c3c;"></i>';
                }
                showToast(response.message, 'success');
            } else {
                showToast(response.error || 'Failed to add to wishlist', 'error');
            }
        }
    } catch (error) {
        console.error('Failed to update wishlist:', error);
        showToast('Failed to update wishlist', 'error');
    }
}

// Remove item from cart (RESTful)
async function removeFromCart(cartItemId) {
    try {
        const response = await apiCall(`customers/${CURRENT_USER_ID}/cart/${cartItemId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showToast(response.message, 'success');
            updateCartCount();
            return true;
        } else {
            showToast(response.error || 'Failed to remove from cart', 'error');
            return false;
        }
    } catch (error) {
        console.error('Failed to remove from cart:', error);
        showToast('Failed to remove from cart', 'error');
        return false;
    }
}

// Update cart item quantity (RESTful)
async function updateCartQuantity(cartItemId, quantity) {
    try {
        const response = await apiCall(`customers/${CURRENT_USER_ID}/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({
                quantity: quantity
            })
        });
        
        if (response.success) {
            updateCartCount();
            return true;
        } else {
            showToast(response.error || 'Failed to update cart', 'error');
            return false;
        }
    } catch (error) {
        console.error('Failed to update cart:', error);
        showToast('Failed to update cart', 'error');
        return false;
    }
}

// Get cart items (RESTful)
async function getCartItems() {
    try {
        const response = await apiCall(`customers/${CURRENT_USER_ID}/cart`);
        if (response.success) {
            return response.cart_items;
        }
        throw new Error(response.error || 'Failed to get cart items');
    } catch (error) {
        console.error('Failed to get cart items:', error);
        throw error;
    }
}

// Get wishlist items (RESTful)
async function getWishlistItems() {
    try {
        const response = await apiCall(`users/${CURRENT_USER_ID}/wishlist`);
        if (response.success) {
            return response.wishlist_items;
        }
        throw new Error(response.error || 'Failed to get wishlist items');
    } catch (error) {
        console.error('Failed to get wishlist items:', error);
        throw error;
    }
}

// Get single product details (RESTful)
async function getProduct(productId) {
    try {
        const response = await apiCall(`products/${productId}`);
        if (response.success) {
            return response.product;
        }
        throw new Error(response.error || 'Failed to get product');
    } catch (error) {
        console.error('Failed to get product:', error);
        throw error;
    }
}

// Handle product click for details
function handleProductClick(productId) {
    // In a real application, you would navigate to product detail page
    // For now, we'll just show product info in console
    getProduct(productId).then(product => {
        console.log('Product details:', product);
        showToast(`Viewing ${product.name}`, 'success');
    }).catch(error => {
        showToast('Failed to load product details', 'error');
    });
}

// Load specific page
function loadPage(page) {
    loadProducts(page, currentFilter, currentSort, currentCategory, currentSearch);
}

// Filter products
function filterProducts(filter) {
    loadProducts(1, filter, currentSort, currentCategory, currentSearch);
}

// Apply filter
function applyFilter(filter) {
    filterProducts(filter);
}

// Apply sort
function applySort(sort) {
    loadProducts(currentPage, currentFilter, sort, currentCategory, currentSearch);
}

// Filter by category
function filterByCategory(category) {
    loadProducts(1, currentFilter, currentSort, category, '');
}

// Perform search
function performSearch(query) {
    if (query.trim() === '') {
        currentSearch = '';
        loadProducts(1, currentFilter, currentSort, currentCategory, '');
        return;
    }
    
    loadProducts(1, 'all', 'newest', '', query.trim());
    showToast(`Searching for: ${query}`, 'success');
}

// Subscribe to newsletter (RESTful)
async function subscribeNewsletter(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        const response = await apiCall('newsletter/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ email: email })
        });
        
        if (response.success) {
            showToast(response.message, 'success');
            emailInput.value = '';
        } else {
            showToast(response.error || 'Subscription failed', 'error');
        }
    } catch (error) {
        console.error('Newsletter subscription failed:', error);
        showToast('Subscription failed. Please try again.', 'error');
    }
}

// Validate email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced search function
const debouncedSearch = debounce((query) => {
    if (query.trim() === '') {
        currentSearch = '';
        loadProducts(1, currentFilter, currentSort, currentCategory, '');
        return;
    }
    
    loadProducts(1, 'all', 'newest', '', query.trim());
    showToast(`Searching for: ${query}`, 'success');
}, 500);

// Setup event listeners
function setupEventListeners() {
    // Category dropdown
    const categoryToggle = document.querySelector('.category-toggle');
    const categoryMenu = document.querySelector('.category-menu');
    
    if (categoryToggle && categoryMenu) {
        categoryToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            categoryMenu.style.display = categoryMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            categoryMenu.style.display = 'none';
        });
        
        // Prevent dropdown from closing when clicking inside
        categoryMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter products
            const filter = this.dataset.filter;
            filterProducts(filter);
        });
    });
    
    // Filter options
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const sort = this.dataset.sort;
            
            if (filter) {
                applyFilter(filter);
            } else if (sort) {
                applySort(sort);
            }
        });
    });
    
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            subscribeNewsletter(this);
        });
    }
    
    // Advanced search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            debouncedSearch(e.target.value);
        });
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value);
            }
        });
        
        const searchBtn = document.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                performSearch(searchInput.value);
            });
        }
    }
}

// Initialize the e-commerce functionality
function initializeEcommerce() {
    console.log('EzyCommerce site initialized');
    
    // Load initial data
    loadProducts();
    loadCategories();
    
    if (CURRENT_USER_ID) {
        updateCartCount();
        updateWishlistCount();
    }
    
    // Setup event listeners
    setupEventListeners();
}

// Initialize on page load
function initializeApp() {
    initializeEcommerce();
    
    // Add click handlers for product cards
    document.addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard && !e.target.closest('.product-actions')) {
            const productId = productCard.dataset.productId;
            if (productId) {
                handleProductClick(productId);
            }
        }
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open dropdowns
            const categoryMenu = document.querySelector('.category-menu');
            if (categoryMenu) {
                categoryMenu.style.display = 'none';
            }
        }
    });
}

// Debug function to test API connectivity
async function testAPIConnection() {
    try {
        console.log('Testing API connection...');
        const response = await apiCall('categories');
        console.log('API Connection successful:', response);
        showToast('API connection successful', 'success');
    } catch (error) {
        console.error('API Connection failed:', error);
        showToast('API connection failed', 'error');
    }
}

// Utility functions for development/testing
window.ecommerceAPI = {
    loadProducts: loadProducts,
    addToCart: addToCart,
    addToWishlist: addToWishlist,
    removeFromCart: removeFromCart,
    updateCartQuantity: updateCartQuantity,
    getCartItems: getCartItems,
    getWishlistItems: getWishlistItems,
    getProduct: getProduct,
    performSearch: performSearch,
    filterProducts: filterProducts,
    applySort: applySort,
    apiCall: apiCall,
    safeApiCall: safeApiCall,
    testAPIConnection: testAPIConnection
};

// Add some helpful console messages for developers
console.log('EzyCommerce Frontend loaded successfully');
console.log('Available API functions:', Object.keys(window.ecommerceAPI));
console.log('Test API connection with: testAPIConnection()');
console.log('Current User ID:', CURRENT_USER_ID);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeEcommerce,
        loadProducts,
        addToCart,
        addToWishlist,
        removeFromCart,
        updateCartQuantity,
        getCartItems,
        getWishlistItems,
        getProduct,
        performSearch,
        apiCall,
        safeApiCall
    };
}