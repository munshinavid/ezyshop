// profile.js - Customer Profile Functionality
// Direct API connection to UserController (no authManager dependency)

// API Base URL - Updated to match UserController structure
const API_BASE_URL = '../controllers/UserController.php';

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

// Initialize the profile functionality
function initializeProfile() {
    console.log('Profile page initialized');
    
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        redirectToLogin();
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Load initial section
    loadSection('dashboard');
    
    // Setup event listeners
    setupEventListeners();
}

// Check if user is logged in
function isUserLoggedIn() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    //alert(token);
    return token && userData;
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = '../views/login.php';
}

// Get authentication token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Get current user data from localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Make authenticated API request
async function makeApiRequest(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('No authentication token found');
    }
    console.log('Making API request to:', url);

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const requestOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, requestOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            redirectToLogin();
            throw new Error('Authentication failed');
        }

        return response;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile menu links
    const menuLinks = document.querySelectorAll('.profile-menu-link');
    menuLinks.forEach(link => {
        if (link.id !== 'logout-btn') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                loadSection(section);
                
                // Update active menu item
                menuLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
    
    // Address modal buttons
    const addAddressBtn = document.getElementById('add-address-btn');
    const addressModal = document.getElementById('address-modal');
    const cancelAddressBtn = document.getElementById('cancel-address-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            showAddressModal();
        });
    }
    
    if (cancelAddressBtn) {
        cancelAddressBtn.addEventListener('click', function() {
            addressModal.style.display = 'none';
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            addressModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    if (addressModal) {
        addressModal.addEventListener('click', function(e) {
            if (e.target === addressModal) {
                addressModal.style.display = 'none';
            }
        });
    }
    
    // Address form submission
    const addressForm = document.getElementById('address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAddress(this);
        });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile(this);
        });
    }
    
    // Refresh orders button
    const refreshOrdersBtn = document.getElementById('refresh-orders-btn');
    if (refreshOrdersBtn) {
        refreshOrdersBtn.addEventListener('click', function() {
            loadOrders();
        });
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('wishlistCount');
    redirectToLogin();
}

// Load section content
function loadSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    const activeSection = document.getElementById(`${section}-section`);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'addresses':
            loadAddresses();
            break;
        case 'wishlist':
            loadWishlist();
            break;
        case 'settings':
            loadProfileForm();
            break;
    }
}

// Load user data
async function loadUserData() {
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // Update UI with cached user data first
        updateUserDisplay(currentUser);
    }
    
    try {
        // Fetch fresh data from server
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=profile`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Update UI with fresh user data
        updateUserDisplay(userData);
        
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
    }
}

// Update user display in UI
function updateUserDisplay(userData) {
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const dashboardUserNameEl = document.getElementById('dashboard-user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    const displayName = fullName || userData.username || 'User';
    
    if (userNameEl) userNameEl.textContent = displayName;
    if (userEmailEl) userEmailEl.textContent = userData.email || '';
    if (dashboardUserNameEl) dashboardUserNameEl.textContent = userData.firstName || userData.username || 'User';
    if (userAvatarEl && userData.avatar) userAvatarEl.src = userData.avatar;
}

// Load dashboard data
async function loadDashboard() {
    // Show loading state
    const recentOrdersEl = document.getElementById('recent-orders');
    if (recentOrdersEl) {
        recentOrdersEl.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=dashboard`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        updateDashboardUI(data);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
        
        // Show fallback UI
        if (recentOrdersEl) {
            recentOrdersEl.innerHTML = '<tr><td colspan="5">Failed to load data. Please try again.</td></tr>';
        }
    }
}

// Update dashboard UI with data
function updateDashboardUI(data) {
    // Update stats
    const ordersCountEl = document.getElementById('orders-count');
    const completedOrdersEl = document.getElementById('completed-orders');
    const wishlistItemsEl = document.getElementById('wishlist-items');
    const addressesCountEl = document.getElementById('addresses-count');
    
    if (ordersCountEl) ordersCountEl.textContent = data.stats.totalOrders || 0;
    if (completedOrdersEl) completedOrdersEl.textContent = data.stats.completedOrders || 0;
    if (wishlistItemsEl) wishlistItemsEl.textContent = data.stats.wishlistItems || 0;
    if (addressesCountEl) addressesCountEl.textContent = data.stats.addressesCount || 0;
    
    // Update recent orders
    const ordersContainer = document.getElementById('recent-orders');
    if (!ordersContainer) return;
    
    if (!data.recentOrders || data.recentOrders.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="5">No recent orders found.</td></tr>';
        return;
    }
    
    let ordersHTML = '';
    data.recentOrders.forEach(order => {
        ordersHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
                <td>
                    <button class="view-order-btn" data-order-id="${order.id}">View</button>
                </td>
            </tr>
        `;
    });
    
    ordersContainer.innerHTML = ordersHTML;
    
    // Add event listeners to view buttons
    const viewButtons = document.querySelectorAll('.view-order-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            viewOrderDetails(orderId);
        });
    });
}

// Load orders
async function loadOrders(page = 1) {
    // Show loading state
    const ordersListEl = document.getElementById('orders-list');
    if (ordersListEl) {
        ordersListEl.innerHTML = '<tr><td colspan="5">Loading orders...</td></tr>';
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=orders&page=${page}&limit=10`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        updateOrdersUI(data.orders || [], data.pagination);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders', 'error');
        
        if (ordersListEl) {
            ordersListEl.innerHTML = '<tr><td colspan="5">Failed to load orders. Please try again.</td></tr>';
        }
    }
}

// Update orders UI with data
function updateOrdersUI(orders, pagination) {
    const ordersContainer = document.getElementById('orders-list');
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="5">No orders found.</td></tr>';
        return;
    }
    
    let ordersHTML = '';
    orders.forEach(order => {
        ordersHTML += `
            <tr>
                <td>#${order.id}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
                <td>
                    <button class="view-order-btn" data-order-id="${order.id}">View</button>
                </td>
            </tr>
        `;
    });
    
    ordersContainer.innerHTML = ordersHTML;
    
    // Add event listeners to view buttons
    const viewButtons = document.querySelectorAll('.view-order-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.orderId;
            viewOrderDetails(orderId);
        });
    });
    
    // Update pagination
    if (pagination) {
        updatePagination(pagination);
    }
}

// Load addresses
async function loadAddresses() {
    // Show loading state
    const addressesListEl = document.getElementById('addresses-list');
    if (addressesListEl) {
        addressesListEl.innerHTML = '<div>Loading addresses...</div>';
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=addresses`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch addresses');
        }
        
        const addresses = await response.json();
        console.log(addresses);
        updateAddressesUI(addresses);
        
    } catch (error) {
        console.error('Error loading addresses:', error);
        showToast('Failed to load addresses', 'error');
        
        if (addressesListEl) {
            addressesListEl.innerHTML = '<div>Failed to load addresses. Please try again.</div>';
        }
    }
}

// Update addresses UI with data
function updateAddressesUI(addresses) {
    const addressesContainer = document.getElementById('addresses-list');
    if (!addressesContainer) return;
    
    if (!addresses || addresses.length === 0) {
        addressesContainer.innerHTML = '<div class="no-addresses">No addresses found. <button class="btn btn-primary" id="add-first-address-btn">Add Your First Address</button></div>';
        
        const addFirstAddressBtn = document.getElementById('add-first-address-btn');
        if (addFirstAddressBtn) {
            addFirstAddressBtn.addEventListener('click', showAddressModal);
        }
        return;
    }
    
    let addressesHTML = '';
    addresses.forEach(address => {
        addressesHTML += `
            <div class="address-card ${address.is_default ? 'default' : ''}">
                ${address.is_default ? '<span class="address-type">Default</span>' : ''}
                <h3 class="address-name">${address.full_name || 'No Name'}</h3>
                <div class="address-details">
                    <p>${address.address_line1 || address.address || 'No Address'}</p>
                    ${address.address_line2 ? `<p>${address.address_line2}</p>` : ''}
                    ${address.city ? `<p>${address.city}${address.state ? ', ' + address.state : ''}${address.zip_code ? ' ' + address.zip_code : ''}</p>` : ''}
                    ${address.country ? `<p>${address.country}</p>` : ''}
                    <p>${address.phone || 'No Phone'}</p>
                </div>
                <div class="address-actions">
                    <button class="address-btn primary edit-address-btn" data-address-id="${address.id}">Edit</button>
                    <button class="address-btn delete-address-btn" data-address-id="${address.id}">Delete</button>
                </div>
            </div>
        `;
    });
    
    addressesContainer.innerHTML = addressesHTML;
    
    // Add event listeners to edit buttons
    const editButtons = document.querySelectorAll('.edit-address-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const addressId = this.dataset.addressId;
            editAddress(addressId);
        });
    });
    
    // Add event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-address-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const addressId = this.dataset.addressId;
            deleteAddress(addressId);
        });
    });
}

// Show address modal
async function showAddressModal(addressId = null) {
    const modal = document.getElementById('address-modal');
    const modalTitle = document.getElementById('address-modal-title');
    const addressForm = document.getElementById('address-form');
    const addressIdField = document.getElementById('address-id');
    
    if (!modal || !addressForm) return;
    
    if (addressId) {
        // Editing existing address
        if (modalTitle) modalTitle.textContent = 'Edit Address';
        if (addressIdField) addressIdField.value = addressId;
        
        try {
            const response = await makeApiRequest(`${API_BASE_URL}?endpoint=addresses&id=${addressId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch address');
            }
            
            const address = await response.json();
            fillAddressForm(address);
            
        } catch (error) {
            console.error('Error loading address:', error);
            showToast('Failed to load address', 'error');
        }
    } else {
        // Adding new address
        if (modalTitle) modalTitle.textContent = 'Add New Address';
        if (addressIdField) addressIdField.value = '';
        addressForm.reset();
    }
    
    modal.style.display = 'flex';
}

// Fill address form with data
function fillAddressForm(address) {
    const fields = {
        'address-type': address.type || 'home',
        'full-name': address.full_name || '',
        'address-line1': address.address_line1 || address.address || '',
        'address-line2': address.address_line2 || '',
        'city': address.city || '',
        'state': address.state || '',
        'zip-code': address.zip_code || '',
        'country': address.country || '',
        'phone': address.phone || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = fields[fieldId];
    });
    
    const defaultAddressField = document.getElementById('default-address');
    if (defaultAddressField) defaultAddressField.checked = address.is_default || false;
}

// Save address
async function saveAddress(form) {
    const formData = new FormData(form);
    const addressId = formData.get('id');
    const isUpdate = addressId && addressId.trim() !== '';
    
    const addressData = {
        type: formData.get('type') || 'home',
        full_name: formData.get('full_name') || formData.get('full-name'),
        address_line1: formData.get('address_line1') || formData.get('address-line1'),
        address_line2: formData.get('address_line2') || formData.get('address-line2') || '',
        city: formData.get('city') || '',
        state: formData.get('state') || '',
        zip_code: formData.get('zip_code') || formData.get('zip-code') || '',
        country: formData.get('country') || '',
        phone: formData.get('phone') || '',
        is_default: formData.get('is_default') === 'on' || formData.get('default-address') === 'on'
    };
    
    try {
        let url, method;
        if (isUpdate) {
            url = `${API_BASE_URL}?endpoint=addresses&id=${addressId}&method=PUT`;
            method = 'POST'; // Using POST with method parameter due to PHP limitations
        } else {
            url = `${API_BASE_URL}?endpoint=addresses&method=POST`;
            method = 'POST';
        }
        
        const response = await makeApiRequest(url, {
            method: method,
            body: JSON.stringify(addressData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save address');
        }
        
        showToast('Address saved successfully', 'success');
        const modal = document.getElementById('address-modal');
        if (modal) modal.style.display = 'none';
        loadAddresses(); // Reload addresses
        
    } catch (error) {
        console.error('Error saving address:', error);
        showToast('Failed to save address', 'error');
    }
}

// Edit address
function editAddress(addressId) {
    showAddressModal(addressId);
}

// Delete address
async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=addresses&id=${addressId}&method=DELETE`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete address');
        }
        
        showToast('Address deleted successfully', 'success');
        loadAddresses(); // Reload addresses
        
    } catch (error) {
        console.error('Error deleting address:', error);
        showToast('Failed to delete address', 'error');
    }
}

// Load profile form with user data
async function loadProfileForm() {
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=profile`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }
        
        const userData = await response.json();
        fillProfileForm(userData);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to cached data
        const userData = getCurrentUser() || {};
        fillProfileForm(userData);
    }
}

// Fill profile form with data
function fillProfileForm(userData) {
    const fields = {
        'first-name': userData.firstName || '',
        'last-name': userData.lastName || '',
        'email': userData.email || '',
        'phone': userData.phone || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = fields[fieldId];
    });
}

// Update user profile
async function updateProfile(form) {
    const formData = new FormData(form);
    
    const profileData = {
        first_name: formData.get('first_name') || formData.get('first-name'),
        last_name: formData.get('last_name') || formData.get('last-name'),
        email: formData.get('email'),
        phone: formData.get('phone')
    };
    
    // Check if password is being updated
    const currentPassword = formData.get('current_password') || formData.get('current-password');
    const newPassword = formData.get('new_password') || formData.get('new-password');
    const confirmPassword = formData.get('confirm_password') || formData.get('confirm-password');
    
    if (newPassword) {
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        if (!currentPassword) {
            showToast('Current password is required to set a new password', 'error');
            return;
        }
        
        profileData.current_password = currentPassword;
        profileData.new_password = newPassword;
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=profile&method=PUT`, {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const updatedUser = await response.json();
        showToast('Profile updated successfully', 'success');
        
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Update UI
        updateUserDisplay(updatedUser);
        
        // Clear password fields
        const passwordFields = ['current_password', 'current-password', 'new_password', 'new-password', 'confirm_password', 'confirm-password'];
        passwordFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) field.value = '';
        });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(error.message || 'Failed to update profile', 'error');
    }
}

// Load wishlist
async function loadWishlist() {
    const wishlistContainer = document.getElementById('wishlist-items-container');
    if (wishlistContainer) {
        wishlistContainer.innerHTML = '<div>Loading wishlist...</div>';
    }
    
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=wishlist`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch wishlist');
        }
        
        const data = await response.json();
        console.log(data);
        updateWishlistUI(data.items || []);
        
    } catch (error) {
        console.error('Error loading wishlist:', error);
        showToast('Failed to load wishlist', 'error');
        
        if (wishlistContainer) {
            wishlistContainer.innerHTML = '<div>Failed to load wishlist. Please try again.</div>';
        }
    }
}

// Update wishlist UI
function updateWishlistUI(items) {
    console.log(items);
    const wishlistContainer = document.getElementById('wishlist-items-container');
    const wishlistRefreshBtn = document.getElementById('refresh-wishlist-btn');
    if (!wishlistContainer) return;
    
    if (!items || items.length === 0) {
        wishlistContainer.innerHTML = '<div class="no-wishlist">Your wishlist is empty.</div>';
        return;
    }
    
    let wishlistHTML = '';
    items.forEach(item => {
        wishlistHTML += `
            <div class="wishlist-item">
                <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.name || 'Product'}" onerror="this.src='/images/placeholder.jpg'">
                <div class="item-details">
                    <h3>${item.name || 'Unknown Product'}</h3>
                    <p class="price">$${parseFloat(item.price || 0).toFixed(2)}</p>
                    <p class="stock">${(item.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${item.product_id}" ${(item.stock || 0) <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary remove-wishlist-btn" data-product-id="${item.product_id}">
                        Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    wishlistContainer.innerHTML = wishlistHTML;
    
    // Add event listeners
    const removeButtons = document.querySelectorAll('.remove-wishlist-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            removeFromWishlist(productId);
        });
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            addToCart(productId);
        });
    });
    //refresh wishlist button
    if (wishlistRefreshBtn) {
        wishlistRefreshBtn.addEventListener('click', function() {
            loadWishlist();
        });
    }
}

// Remove from wishlist
async function removeFromWishlist(productId) {
    try {
        const response = await makeApiRequest(`${API_BASE_URL}?endpoint=wishlist&id=${productId}&method=DELETE`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to remove from wishlist');
        }
        
        showToast('Item removed from wishlist', 'success');
        loadWishlist(); // Reload wishlist
        
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showToast('Failed to remove from wishlist', 'error');
    }
}
//add to cart function
async function addToCart(productId) {
    try {
        const customer = getCurrentUser();
        const customerId = customer ? customer.id : null;
        if (!customerId) throw new Error('User not logged in');

        const quantity = 1; // Default quantity to add
        const API_URL = '../controllers/HomeController.php/cart'; // RESTful path

        const response = await makeApiRequest(API_URL, {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, customer_id: customerId, quantity })
        });
        // const text=await response.text();
        // console.log(text);

        if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

        const data = await response.json();

        if (data.success) {
            alert('Item added to cart successfully!');
            const cartCountEl = document.getElementById('cart-count');
            if (cartCountEl) cartCountEl.innerText = data.cart_count;
        } else {
            alert(data.message || 'Failed to add item to cart');
        }

    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('An error occurred while adding the item to cart. Please try again.');
    }
}


// View order details
function viewOrderDetails(orderId) {
    console.log('Viewing order details for:', orderId);
    showToast(`Loading order #${orderId} details`, 'info');
    
    // You could implement this to show order details in a modal or navigate to a details page
    // window.location.href = `order-details.html?id=${orderId}`;
}

// Utility functions

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <span style="margin-right: 10px; font-weight: bold; font-size: 16px;">${icons[type]}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            margin-left: auto;
            cursor: pointer;
            padding: 0 0 0 15px;
            font-size: 18px;
        ">×</button>
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    if (!document.querySelector('style[data-toast-styles]')) {
        style.setAttribute('data-toast-styles', '');
        document.head.appendChild(style);
    }
    
    toastContainer.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Update pagination
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('orders-pagination');
    if (!paginationContainer || !pagination) return;
    
    let paginationHTML = '';
    
    // Previous button
    if (pagination.currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" data-page="${pagination.currentPage - 1}">‹ Prev</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === pagination.currentPage || 
            i === 1 || 
            i === pagination.totalPages || 
            (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)) {
            paginationHTML += `<button class="pagination-btn ${i === pagination.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Next button
    if (pagination.currentPage < pagination.totalPages) {
        paginationHTML += `<button class="pagination-btn" data-page="${pagination.currentPage + 1}">Next ›</button>`;
    }
    
    paginationContainer.innerHTML = paginationHTML;
    
    // Add event listeners to pagination buttons
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    paginationBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) {
                loadOrders(parseInt(page));
            }
        });
    });
}

// Additional utility functions for cart and wishlist counts
function updateCartAndWishlistCounts() {
    // Update cart and wishlist counts from localStorage or API
    const cartCount = localStorage.getItem('cartCount') || 0;
    const wishlistCount = localStorage.getItem('wishlistCount') || 0;
    
    const cartCountEl = document.getElementById('cart-count');
    const wishlistCountEl = document.getElementById('wishlist-count');
    
    if (cartCountEl) cartCountEl.textContent = cartCount;
    if (wishlistCountEl) wishlistCountEl.textContent = wishlistCount;
}

// Initialize cart and wishlist counts on load
document.addEventListener('DOMContentLoaded', function() {
    updateCartAndWishlistCounts();
});

// Error handling wrapper for all API calls
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    // Check if it's an authentication error
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
        showToast('Session expired. Please log in again.', 'error');
        setTimeout(() => {
            logout();
        }, 2000);
        return;
    }
    
    // Show user-friendly error message
    const message = error.message || defaultMessage;
    showToast(message, 'error');
}

// Refresh user session periodically
function startSessionRefresh() {
    // Refresh session every 15 minutes by checking if token is still valid
    setInterval(async () => {
        try {
            if (isUserLoggedIn()) {
                const response = await makeApiRequest(`${API_BASE_URL}?endpoint=profile`);
                if (!response.ok) {
                    throw new Error('Session invalid');
                }
            }
        } catch (error) {
            console.error('Session refresh failed:', error);
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                logout();
            }
        }
    }, 15 * 60 * 1000); // 15 minutes
}

// Initialize session refresh when profile loads
document.addEventListener('DOMContentLoaded', function() {
    if (isUserLoggedIn()) {
        startSessionRefresh();
    }
});