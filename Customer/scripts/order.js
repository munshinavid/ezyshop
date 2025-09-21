/**
 * EzyCommerce - Orders JavaScript
 * Order management and tracking functionality
 */

// Orders specific variables
let orders = [];
let ordersInitialized = false;

// Initialize orders functionality
function initializeOrders() {
    console.log('Initializing orders...');
    
    if (ordersInitialized) {
        console.log('Orders already initialized');
        return;
    }
    
    setupOrdersEventListeners();
    
    // Load orders if on orders page
    const ordersContainer = document.getElementById('ordersContainer');
    if (ordersContainer) {
        loadOrdersPage();
    }
    
    ordersInitialized = true;
    console.log('Orders initialization complete');
}

// Setup orders-specific event listeners
function setupOrdersEventListeners() {
    console.log('Setting up orders event listeners...');
    
    document.addEventListener('click', function(e) {
        // View order details
        if (e.target.classList.contains('view-order-btn') || e.target.closest('.view-order-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('view-order-btn') ? e.target : e.target.closest('.view-order-btn');
            const orderId = btn.getAttribute('data-order-id');
            if (orderId) {
                viewOrderDetails(orderId);
            }
        }
        
        // Cancel order
        if (e.target.classList.contains('cancel-order-btn') || e.target.closest('.cancel-order-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('cancel-order-btn') ? e.target : e.target.closest('.cancel-order-btn');
            const orderId = btn.getAttribute('data-order-id');
            if (orderId) {
                cancelOrder(orderId);
            }
        }
        
        // Reorder
        if (e.target.classList.contains('reorder-btn') || e.target.closest('.reorder-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('reorder-btn') ? e.target : e.target.closest('.reorder-btn');
            const orderId = btn.getAttribute('data-order-id');
            if (orderId) {
                reorder(orderId);
            }
        }
        
        // Track order
        if (e.target.classList.contains('track-order-btn') || e.target.closest('.track-order-btn')) {
            e.preventDefault();
            const btn = e.target.classList.contains('track-order-btn') ? e.target : e.target.closest('.track-order-btn');
            const orderId = btn.getAttribute('data-order-id');
            if (orderId) {
                trackOrder(orderId);
            }
        }
    });
}

// ========== ORDERS DATA LOADING ==========

// Load orders page
async function loadOrdersPage() {
    console.log('Loading orders page...');
    
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) {
        console.error('Orders container not found');
        return;
    }
    
    if (!window.EzyCommerce || !window.EzyCommerce.isLoggedIn()) {
        ordersContainer.innerHTML = `
            <div class="orders-error">
                <i class="fas fa-user-lock fa-3x"></i>
                <h3>Please Login</h3>
                <p>You need to be logged in to view your orders.</p>
                <a href="login.php" class="login-btn">
                    <i class="fas fa-sign-in-alt"></i> Login
                </a>
            </div>
        `;
        return;
    }
    
    try {
        showLoading('Loading your orders...', ordersContainer);
        
        const data = await fetchOrdersData();
        
        if (data && (data.success || data.status === 'success')) {
            renderOrdersPage(data);
        } else {
            throw new Error(data.message || 'Failed to load orders');
        }
        
    } catch (error) {
        console.error('Error loading orders page:', error);
        
        ordersContainer.innerHTML = `
            <div class="orders-error">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Unable to load orders</h3>
                <p>${error.message || 'Please check your connection and try again.'}</p>
                <div class="error-actions">
                    <button onclick="loadOrdersPage()" class="retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                    <a href="index.php" class="continue-shopping-btn">
                        <i class="fas fa-arrow-left"></i> Continue Shopping
                    </a>
                </div>
            </div>
        `;
    }
}

// Fetch orders data from backend
async function fetchOrdersData() {
    console.log('Fetching orders data...');
    
    try {
        const url = '../controllers/OrderController.php?action=fetchOrders';
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        console.log('Orders response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Orders data received:', data);
        
        if (data.success || data.status === 'success') {
            orders = data.orders || [];
            return data;
        } else {
            throw new Error(data.message || 'Failed to fetch orders');
        }
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
}

// ========== ORDERS PAGE RENDERING ==========

// Render orders page
function renderOrdersPage(data) {
    console.log('Rendering orders page with data:', data);
    
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) {
        console.error('Orders container not found');
        return;
    }
    
    orders = data.orders || [];
    
    // Handle no orders
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-clipboard-list fa-4x"></i>
                <h2>No orders yet</h2>
                <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
                <a href="index.php" class="start-shopping-btn">
                    <i class="fas fa-shopping-cart"></i> Start Shopping
                </a>
            </div>
        `;
        return;
    }
    
    // Render orders list
    const ordersHTML = `
        <div class="orders-content">
            <div class="orders-header">
                <h2><i class="fas fa-clipboard-list"></i> Your Orders</h2>
                <p class="orders-count">${orders.length} order${orders.length !== 1 ? 's' : ''} found</p>
            </div>
            
            <div class="orders-filters">
                <select id="orderStatusFilter" class="filter-select">
                    <option value="">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                
                <select id="orderTimeFilter" class="filter-select">
                    <option value="">All Time</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                </select>
            </div>
            
            <div class="orders-list">
                ${orders.map(order => renderOrderCard(order)).join('')}
            </div>
        </div>
    `;
    
    ordersContainer.innerHTML = ordersHTML;
    
    // Setup filter listeners
    setupOrdersFilters();
}

// Render individual order card
function renderOrderCard(order) {
    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const statusClass = getOrderStatusClass(order.order_status);
    const statusIcon = getOrderStatusIcon(order.order_status);
    
    return `
        <div class="order-card" data-order-id="${order.order_id}" data-status="${order.order_status}">
            <div class="order-header">
                <div class="order-info">
                    <h3 class="order-id">Order #${order.order_id}</h3>
                    <p class="order-date">
                        <i class="fas fa-calendar"></i>
                        Placed on ${formattedDate}
                    </p>
                </div>
                
                <div class="order-status">
                    <span class="status-badge ${statusClass}">
                        <i class="fas fa-${statusIcon}"></i>
                        ${order.order_status}
                    </span>
                </div>
            </div>
            
            <div class="order-details">
                <div class="order-items-preview">
                    <div class="items-count">
                        <i class="fas fa-box"></i>
                        ${order.item_count || 1} item${(order.item_count || 1) !== 1 ? 's' : ''}
                    </div>
                </div>
                
                <div class="order-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount">${formatCurrency(order.total_amount)}</span>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="view-order-btn btn-outline" data-order-id="${order.order_id}">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                
                ${order.order_status === 'Pending' ? `
                    <button class="cancel-order-btn btn-danger" data-order-id="${order.order_id}">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                ` : ''}
                
                ${order.order_status === 'Delivered' ? `
                    <button class="reorder-btn btn-primary" data-order-id="${order.order_id}">
                        <i class="fas fa-redo"></i>
                        Reorder
                    </button>
                ` : ''}
                
                ${(order.order_status === 'Shipped' || order.order_status === 'Delivered') ? `
                    <button class="track-order-btn btn-info" data-order-id="${order.order_id}">
                        <i class="fas fa-truck"></i>
                        Track
                    </button>
                ` : ''}
            </div>
            
            ${order.tracking_number ? `
                <div class="tracking-info">
                    <small>
                        <i class="fas fa-barcode"></i>
                        Tracking: ${order.tracking_number}
                    </small>
                </div>
            ` : ''}
        </div>
    `;
}

// Get order status CSS class
function getOrderStatusClass(status) {
    switch (status) {
        case 'Pending': return 'status-pending';
        case 'Shipped': return 'status-shipped';
        case 'Delivered': return 'status-delivered';
        case 'Cancelled': return 'status-cancelled';
        default: return 'status-unknown';
    }
}

// Get order status icon
function getOrderStatusIcon(status) {
    switch (status) {
        case 'Pending': return 'clock';
        case 'Shipped': return 'truck';
        case 'Delivered': return 'check-circle';
        case 'Cancelled': return 'times-circle';
        default: return 'question-circle';
    }
}

// ========== ORDER ACTIONS ==========

// View order details
async function viewOrderDetails(orderId) {
    console.log('Viewing order details for:', orderId);
    
    try {
        showLoading('Loading order details...');
        
        const url = `../controllers/OrderController.php?action=getOrderDetails&order_id=${orderId}`;
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order details:', data);
        
        hideLoading();
        
        if (data.success || data.status === 'success') {
            showOrderDetailsModal(data.order);
        } else {
            throw new Error(data.message || 'Failed to load order details');
        }
        
    } catch (error) {
        console.error('Error loading order details:', error);
        hideLoading();
        showNotification(error.message || 'Failed to load order details', 'error');
    }
}

// Show order details modal
function showOrderDetailsModal(order) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('orderDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'orderDetailsModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    modal.innerHTML = `
        <div class="modal-content order-details-modal">
            <div class="modal-header">
                <h2><i class="fas fa-receipt"></i> Order Details</h2>
                <button class="close" onclick="closeOrderDetailsModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="order-summary">
                    <div class="summary-row">
                        <strong>Order ID:</strong> #${order.order_id}
                    </div>
                    <div class="summary-row">
                        <strong>Date:</strong> ${formattedDate}
                    </div>
                    <div class="summary-row">
                        <strong>Status:</strong> 
                        <span class="status-badge ${getOrderStatusClass(order.order_status)}">
                            ${order.order_status}
                        </span>
                    </div>
                    <div class="summary-row">
                        <strong>Total:</strong> ${formatCurrency(order.total_amount)}
                    </div>
                </div>
                
                ${order.items ? `
                    <div class="order-items-section">
                        <h3>Order Items</h3>
                        <div class="order-items-list">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <img src="${item.image_url || 'https://via.placeholder.com/60x60'}" 
                                         alt="${item.name}"
                                         onerror="this.src='https://via.placeholder.com/60x60/6c757d/ffffff?text=No+Image'">
                                    <div class="item-details">
                                        <h4>${item.name}</h4>
                                        <p>Quantity: ${item.quantity}</p>
                                        <p>Price: ${formatCurrency(item.price_at_purchase)}</p>
                                    </div>
                                    <div class="item-total">
                                        ${formatCurrency(parseFloat(item.price_at_purchase) * parseInt(item.quantity))}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${order.shipping_info ? `
                    <div class="shipping-section">
                        <h3>Shipping Information</h3>
                        <div class="shipping-details">
                            <p><strong>Status:</strong> ${order.shipping_info.status}</p>
                            ${order.shipping_info.tracking_number ? 
                                `<p><strong>Tracking Number:</strong> ${order.shipping_info.tracking_number}</p>` : 
                                ''
                            }
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-footer">
                <button onclick="closeOrderDetailsModal()" class="btn-secondary">Close</button>
                ${order.order_status === 'Pending' ? 
                    `<button onclick="cancelOrder(${order.order_id}); closeOrderDetailsModal();" class="btn-danger">Cancel Order</button>` : 
                    ''
                }
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Close order details modal
function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cancel order
async function cancelOrder(orderId) {
    console.log('Cancelling order:', orderId);
    
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    try {
        const url = `../controllers/OrderController.php?action=cancelOrder&order_id=${orderId}`;
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Cancel order result:', result);
        
        if (result.success || result.status === 'success') {
            showNotification('Order cancelled successfully', 'success');
            
            // Reload orders page
            loadOrdersPage();
        } else {
            throw new Error(result.message || 'Failed to cancel order');
        }
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification(error.message || 'Failed to cancel order', 'error');
    }
}

// Reorder
async function reorder(orderId) {
    console.log('Reordering from order:', orderId);
    
    if (!confirm('Add all items from this order to your cart?')) {
        return;
    }
    
    try {
        showLoading('Adding items to cart...');
        
        const url = `../controllers/OrderController.php?action=reorder&order_id=${orderId}`;
        console.log('Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Reorder result:', result);
        
        hideLoading();
        
        if (result.success || result.status === 'success') {
            showNotification('Items added to cart successfully!', 'success');
            
            // Update cart count if cart functionality is available
            if (window.EzyCommerce && window.EzyCommerce.fetchCartData) {
                await window.EzyCommerce.fetchCartData();
            }
            
            // Redirect to cart after a delay
            setTimeout(() => {
                window.location.href = 'cart.php';
            }, 2000);
        } else {
            throw new Error(result.message || 'Failed to reorder items');
        }
        
    } catch (error) {
        console.error('Error reordering:', error);
        hideLoading();
        showNotification(error.message || 'Failed to reorder items', 'error');
    }
}

// Track order
function trackOrder(orderId) {
    console.log('Tracking order:', orderId);
    
    const order = orders.find(o => o.order_id == orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    // Create tracking modal
    showTrackingModal(order);
}

// Show tracking modal
function showTrackingModal(order) {
    let modal = document.getElementById('trackingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'trackingModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    const trackingSteps = getTrackingSteps(order.order_status);
    
    modal.innerHTML = `
        <div class="modal-content tracking-modal">
            <div class="modal-header">
                <h2><i class="fas fa-truck"></i> Track Order #${order.order_id}</h2>
                <button class="close" onclick="closeTrackingModal()">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="tracking-timeline">
                    ${trackingSteps.map(step => `
                        <div class="tracking-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}">
                            <div class="step-icon">
                                <i class="fas fa-${step.icon}"></i>
                            </div>
                            <div class="step-content">
                                <h4>${step.title}</h4>
                                <p>${step.description}</p>
                                ${step.date ? `<small class="step-date">${step.date}</small>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${order.tracking_number ? `
                    <div class="tracking-info">
                        <h4>Tracking Information</h4>
                        <p><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                        <p><strong>Current Status:</strong> ${order.order_status}</p>
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-footer">
                <button onclick="closeTrackingModal()" class="btn-primary">Close</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Close tracking modal
function closeTrackingModal() {
    const modal = document.getElementById('trackingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Get tracking steps based on order status
function getTrackingSteps(status) {
    const steps = [
        {
            title: 'Order Placed',
            description: 'Your order has been received and is being processed',
            icon: 'check-circle',
            completed: true,
            current: status === 'Pending'
        },
        {
            title: 'Order Shipped',
            description: 'Your order has been shipped and is on its way',
            icon: 'truck',
            completed: ['Shipped', 'Delivered'].includes(status),
            current: status === 'Shipped'
        },
        {
            title: 'Order Delivered',
            description: 'Your order has been delivered successfully',
            icon: 'home',
            completed: status === 'Delivered',
            current: status === 'Delivered'
        }
    ];
    
    if (status === 'Cancelled') {
        return [
            {
                title: 'Order Cancelled',
                description: 'Your order has been cancelled',
                icon: 'times-circle',
                completed: true,
                current: true
            }
        ];
    }
    
    return steps;
}

// ========== ORDERS FILTERING ==========

// Setup orders filters
function setupOrdersFilters() {
    const statusFilter = document.getElementById('orderStatusFilter');
    const timeFilter = document.getElementById('orderTimeFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyOrdersFilters);
    }
    
    if (timeFilter) {
        timeFilter.addEventListener('change', applyOrdersFilters);
    }
}

// Apply orders filters
function applyOrdersFilters() {
    const statusFilter = document.getElementById('orderStatusFilter');
    const timeFilter = document.getElementById('orderTimeFilter');
    
    let filteredOrders = [...orders];
    
    // Apply status filter
    if (statusFilter && statusFilter.value) {
        filteredOrders = filteredOrders.filter(order => order.order_status === statusFilter.value);
    }
    
    // Apply time filter
    if (timeFilter && timeFilter.value) {
        const days = parseInt(timeFilter.value);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            return orderDate >= cutoffDate;
        });
    }
    
    // Re-render orders list
    const ordersList = document.querySelector('.orders-list');
    if (ordersList) {
        if (filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="no-orders-filtered">
                    <i class="fas fa-filter fa-2x"></i>
                    <h3>No orders match your filters</h3>
                    <p>Try adjusting your filters to see more orders.</p>
                </div>
            `;
        } else {
            ordersList.innerHTML = filteredOrders.map(order => renderOrderCard(order)).join('');
        }
    }
    
    // Update count
    const ordersCount = document.querySelector('.orders-count');
    if (ordersCount) {
        ordersCount.textContent = `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`;
    }
}

// ========== UTILITY FUNCTIONS ==========

// Format currency (uses global function if available)
function formatCurrency(amount) {
    if (window.EzyCommerce && window.EzyCommerce.formatCurrency) {
        return window.EzyCommerce.formatCurrency(amount);
    }
    return `${parseFloat(amount || 0).toFixed(2)}`;
}

// Show notification (uses global function if available)
function showNotification(message, type) {
    if (window.EzyCommerce && window.EzyCommerce.showNotification) {
        return window.EzyCommerce.showNotification(message, type);
    }
    // Fallback
    alert(`${type.toUpperCase()}: ${message}`);
}

// Show loading (uses global function if available)
function showLoading(message, target) {
    if (window.EzyCommerce && window.EzyCommerce.showLoading) {
        return window.EzyCommerce.showLoading(message, target);
    }
}

// Hide loading (uses global function if available)
function hideLoading(target) {
    if (window.EzyCommerce && window.EzyCommerce.hideLoading) {
        return window.EzyCommerce.hideLoading(target);
    }
}

// ========== EXPORT FUNCTIONS ==========

// Export orders functions to global object
if (typeof window.EzyCommerce === 'undefined') {
    window.EzyCommerce = {};
}

Object.assign(window.EzyCommerce, {
    // Orders operations
    loadOrdersPage: loadOrdersPage,
    fetchOrdersData: fetchOrdersData,
    getOrders: () => orders,
    
    // Order actions
    viewOrderDetails: viewOrderDetails,
    cancelOrder: cancelOrder,
    reorder: reorder,
    trackOrder: trackOrder,
    
    // Initialization
    initializeOrders: initializeOrders
});

// Make some functions globally available for onclick handlers
window.loadOrdersPage = loadOrdersPage;
window.viewOrderDetails = viewOrderDetails;
window.cancelOrder = cancelOrder;
window.reorder = reorder;
window.trackOrder = trackOrder;
window.closeOrderDetailsModal = closeOrderDetailsModal;
window.closeTrackingModal = closeTrackingModal;

console.log('EzyCommerce orders.js loaded successfully');