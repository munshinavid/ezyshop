// cart.js - Smooth Cart Management for PHP Backend
document.addEventListener('DOMContentLoaded', initializeCart);

// Configuration
const userData = JSON.parse(localStorage.getItem("userData"));
const authToken= localStorage.getItem("authToken");
const API_BASE_URL = '../controllers/CartController.php'; // Base API endpoint
const CURRENT_USER_ID = userData ? userData.id : null;

function initializeCart() {
    console.log('Cart page initialized');
    loadCartData();
    setupCartEventListeners();
}

// --- Event Listeners ---
function setupCartEventListeners() {
    // Use event delegation on the cart container instead of document
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;

    cartContainer.addEventListener('click', function(e) {
        console.log('Click detected on:', e.target.className); // Debug log
        
        const itemEl = e.target.closest('.cart-item');
        if (!itemEl) return;
        
        // Prevent default for all button clicks
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('quantity-btn')) {
            e.preventDefault();
        }

        if (e.target.classList.contains('quantity-minus')) {
            console.log('Minus button clicked'); // Debug log
            changeQuantity(itemEl, -1);
        } else if (e.target.classList.contains('quantity-plus')) {
            console.log('Plus button clicked'); // Debug log
            changeQuantity(itemEl, 1);
        } else if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            console.log('Remove button clicked'); // Debug log
            removeItem(itemEl);
        }
    });

    // Separate event listener for input changes
    cartContainer.addEventListener('change', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            console.log('Input changed:', e.target.value); // Debug log
            const itemEl = e.target.closest('.cart-item');
            const newValue = parseInt(e.target.value) || 1;
            setQuantity(itemEl, newValue);
        }
    });

    // Also listen for input events (real-time changes)
    cartContainer.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-input')) {
            const itemEl = e.target.closest('.cart-item');
            const newValue = parseInt(e.target.value) || 1;
            if (newValue >= 1) {
                // Only update UI immediately if valid number
                updateCartItemCountAndTotal();
            }
        }
    });
}

// --- Load Cart from Backend ---
async function loadCartData() {
    const container = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    if (!container) return;

    container.classList.add('loading');

    try {
        const res = await fetch('../controllers/CartController.php?action=fetchCart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: CURRENT_USER_ID }),
            credentials: 'include'
        });
        const data = await res.json();
        console.log('Cart fetch response:', data);

        if (data.success) {
            renderCartItems(data.cartItems);
            updateCartSummary(data);
        } else {
            renderCartItems([]);
        }
    } catch (err) {
        console.error('Error loading cart:', err);
        renderCartItems([]);
    } finally {
        container.classList.remove('loading');
    }
}

// --- Render Cart Items ---
function renderCartItems(items) {
    const container = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    if (!container) return;

    if (!items || items.length === 0) {
        emptyCart.style.display = 'block';
        container.innerHTML = '';
        document.getElementById('cart-item-count').textContent = "0 items";
        document.getElementById('cart-count').textContent = "0";
        document.getElementById('subtotal').textContent = "৳0";
        document.getElementById('shipping').textContent = "৳0";
        document.getElementById('total').textContent = "৳0";
        return;
    }

    emptyCart.style.display = 'none';
    let html = '';
    items.forEach(item => {
        html += `
        <div class="cart-item" data-cart-item-id="${item.cart_item_id}" data-product-id="${item.product_id}">
            <img src="${item.image_url}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">৳${item.price}</div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" class="quantity-btn quantity-minus" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="999">
                        <button type="button" class="quantity-btn quantity-plus">+</button>
                    </div>
                    <button type="button" class="remove-btn"><i class="fas fa-trash"></i> Remove</button>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;

    updateCartItemCountAndTotal(); // initial totals
}

// --- Update Cart Summary ---
function updateCartSummary(data) {
    document.getElementById('subtotal').textContent = `৳${data.subtotal}`;
    document.getElementById('shipping').textContent = `৳${data.shippingCost}`;
    document.getElementById('total').textContent = `৳${data.totalCost}`;
}

// --- Optimistic UI Updates ---
// Change quantity with debouncing to prevent multiple rapid calls
let quantityUpdateTimeout = null;

async function changeQuantity(itemEl, delta) {
    console.log('changeQuantity called with delta:', delta); // Debug log
    
    const input = itemEl.querySelector('.quantity-input');
    const currentQty = parseInt(input.value) || 0;
    let newQty = currentQty + delta;
    
    if (newQty < 1) newQty = 1;

    // Update UI instantly
    input.value = newQty;
    updateCartItemCountAndTotal();

    // Clear any existing timeout
    if (quantityUpdateTimeout) {
        clearTimeout(quantityUpdateTimeout);
    }

    // Debounce the backend call
    quantityUpdateTimeout = setTimeout(async () => {
        console.log('Sending quantity update to backend:', newQty);
        const result = await updateQuantityBackend(itemEl.dataset.cartItemId, newQty);
        
        // If backend operation fails, revert the UI change
        if (!result.success) {
            console.error('Failed to update quantity:', result.message);
            // Revert UI change
            input.value = currentQty;
            updateCartItemCountAndTotal();
            alert('Failed to update quantity: ' + result.message);
        } else {
            console.log('Quantity updated successfully');
        }
    }, 300); // 300ms debounce
}

// Set quantity from input with debouncing
let inputUpdateTimeout = null;

async function setQuantity(itemEl, qty) {
    console.log('setQuantity called with qty:', qty); // Debug log
    
    if (qty < 1) qty = 1;
    if (qty > 999) qty = 999; // reasonable upper limit

    const input = itemEl.querySelector('.quantity-input');
    const originalQty = parseInt(input.dataset.originalValue || input.value);
    
    // Store original value for potential reversion
    if (!input.dataset.originalValue) {
        input.dataset.originalValue = input.value;
    }
    
    input.value = qty; // update UI instantly
    updateCartItemCountAndTotal();

    // Clear any existing timeout
    if (inputUpdateTimeout) {
        clearTimeout(inputUpdateTimeout);
    }

    // Debounce the backend call
    inputUpdateTimeout = setTimeout(async () => {
        console.log('Sending input quantity update to backend:', qty);
        const result = await updateQuantityBackend(itemEl.dataset.cartItemId, qty);
        
        if (result.success) {
            // Update the original value reference
            input.dataset.originalValue = qty;
            console.log('Input quantity updated successfully');
        } else {
            console.error('Failed to set quantity:', result.message);
            // Revert UI change
            input.value = originalQty;
            updateCartItemCountAndTotal();
            alert('Failed to update quantity: ' + result.message);
        }
    }, 500); // 500ms debounce for input
}

// Remove item
async function removeItem(itemEl) {
    console.log('removeItem called'); // Debug log
    
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }
    
    // Store original item for potential restoration
    const originalParent = itemEl.parentNode;
    const originalHTML = itemEl.outerHTML;
    const nextSibling = itemEl.nextSibling;
    
    // Add removing class for visual feedback
    itemEl.classList.add('removing');
    
    setTimeout(async () => {
        itemEl.remove(); // remove from UI after animation
        updateCartItemCountAndTotal();

        console.log('Sending remove request to backend');
        const result = await removeItemBackend(itemEl.dataset.cartItemId);
        
        // If backend operation fails, restore the item
        if (!result.success) {
            console.error('Failed to remove item:', result.message);
            // Restore the item
            const restoredElement = createElementFromHTML(originalHTML);
            if (nextSibling) {
                originalParent.insertBefore(restoredElement, nextSibling);
            } else {
                originalParent.appendChild(restoredElement);
            }
            updateCartItemCountAndTotal();
            alert('Failed to remove item: ' + result.message);
        } else {
            console.log('Item removed successfully');
        }
    }, 200); // Small delay for visual feedback
}

// Helper function to create DOM element from HTML string
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// --- Update Cart Header & Totals ---
function updateCartItemCountAndTotal() {
    const items = document.querySelectorAll('.cart-item');
    let totalQty = 0, subtotal = 0;

    items.forEach(item => {
        const qtyInput = item.querySelector('.quantity-input');
        const priceElement = item.querySelector('.cart-item-price');
        
        if (qtyInput && priceElement) {
            const qty = parseInt(qtyInput.value) || 0;
            const price = parseFloat(priceElement.textContent.replace('৳', '')) || 0;
            totalQty += qty;
            subtotal += qty * price;
        }
    });

    // Update count displays
    const itemCountElement = document.getElementById('cart-item-count');
    const cartCountElement = document.getElementById('cart-count');
    
    if (itemCountElement) itemCountElement.textContent = `${items.length} items`;
    if (cartCountElement) cartCountElement.textContent = totalQty;

    // Calculate shipping
    const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 50) : 0; // Free shipping over ৳1000
    const total = subtotal + shipping;

    // Update price displays
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `৳${subtotal.toFixed(2)}`;
    if (shippingElement) shippingElement.textContent = `৳${shipping.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `৳${total.toFixed(2)}`;

    // Show/hide empty cart message
    const emptyCart = document.getElementById('empty-cart');
    if (emptyCart) {
        emptyCart.style.display = items.length === 0 ? 'block' : 'none';
    }
}

// --- Backend AJAX Calls ---
// Update quantity
async function updateQuantityBackend(cartItemId, quantity) {
    try {
        console.log(`Updating quantity for cart item ${cartItemId} to ${quantity}`);
        const res = await fetch(
            `../controllers/CartController.php?action=updateQuantity&cart_item_id=${cartItemId}&quantity=${quantity}&user_id=${CURRENT_USER_ID}`,
            { method: 'GET', credentials: 'include' }
        );
        const data = await res.json();
        console.log('updateQuantityBackend response:', data);
        return data;
    } catch (err) {
        console.error('updateQuantityBackend failed:', err);
        return { success: false, message: err.message };
    }
}

// Remove item
async function removeItemBackend(cartItemId) {
    try {
        console.log(`Removing cart item ${cartItemId}`);
        const res = await fetch(
            `../controllers/CartController.php?action=removeFromCart&cart_item_id=${cartItemId}&user_id=${CURRENT_USER_ID}`,
            { method: 'GET', credentials: 'include' }
        );
        const data = await res.json();
        console.log('removeItemBackend response:', data);
        return data;
    } catch (err) {
        console.error('removeItemBackend failed:', err);
        return { success: false, message: err.message };
    }
}

// Add to cart function (for other pages)
async function addToCart(productId, quantity = 1) {
    try {
        const res = await fetch(
            `../controllers/CartController.php?action=addToCart&product_id=${productId}&quantity=${quantity}&user_id=${CURRENT_USER_ID}`,
            { method: 'GET', credentials: 'include' }
        );
        const data = await res.json();
        console.log('addToCart response:', data);
        return data;
    } catch (err) {
        console.error('addToCart failed:', err);
        return { success: false, message: err.message };
    }
}

// Place order function
async function placeOrder(customerDetails, paymentMethod = 'Cash on Delivery') {
    try {
        const formData = new FormData();
        formData.append('action', 'placeOrder');
        formData.append('payment_method', paymentMethod);
        formData.append('user_id', CURRENT_USER_ID);
        
        // Add customer details
        Object.keys(customerDetails).forEach(key => {
            formData.append(`customer_details[${key}]`, customerDetails[key]);
        });

        const res = await fetch('../controllers/CartController.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await res.json();
        console.log('placeOrder response:', data);
        return data;
    } catch (err) {
        console.error('placeOrder failed:', err);
        return { success: false, message: err.message };
    }
}

// Clear cart function
async function clearCart() {
    try {
        const res = await fetch(
            `../controllers/CartController.php?action=clearCart&user_id=${CURRENT_USER_ID}`,
            { method: 'GET', credentials: 'include' }
        );
        const data = await res.json();
        console.log('clearCart response:', data);
        
        if (data.success) {
            loadCartData(); // Reload cart to reflect changes
        }
        
        return data;
    } catch (err) {
        console.error('clearCart failed:', err);
        return { success: false, message: err.message };
    }
}

// --- Checkout Button Handler ---
const checkoutBtn = document.querySelector('.checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeBtn = document.querySelector('.close-btn');

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async function () {
        console.log('Checkout button clicked');
        // Show modal
        checkoutModal.style.display = 'block';
        await loadAddresses();
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });
}
async function loadAddresses() {
    // const userData = JSON.parse(localStorage.getItem("userData"));
    // if (!userData || !userData.token) {
    //     alert("You are not logged in!");
    //     return;
    // }
    //get authtoken from localstorage
    console.log(authToken);

    try {
        const res = await fetch("../controllers/UserController.php?endpoint=addresses", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`
            },
            credentials: "include"
        });

        const data = await res.json();
        console.log("Addresses:", data);

        if (Array.isArray(data)) {
            renderAddressOptions(data);
        } else if (data.error) {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error("Failed to load addresses:", err);
    }
}

// --- Checkout Modal: Address rendering & interactions ---
let selectedAddressId = null;

function renderAddressOptions(addresses) {
	const listEl = document.getElementById('address-list');
	const confirmBtn = document.getElementById('confirm-order-btn');
	const errorEl = document.getElementById('address-error');
	selectedAddressId = null;
	if (confirmBtn) confirmBtn.disabled = true;
	if (!listEl) return;

	if (!addresses || addresses.length === 0) {
		listEl.innerHTML = '<p>No saved addresses found. Please add a new address.</p>';
		return;
	}

	const cardsHtml = addresses.map(addr => {
		const isDefault = Number(addr.is_default) === 1;
		const type = addr.type || (isDefault ? 'default' : 'home');
		return `
			<div class="address-card" data-id="${addr.id}" role="button" tabindex="0">
				${isDefault ? '<span class="badge-default">Default</span>' : ''}
				<div class="address-type">${type}</div>
				<div class="address-name">${escapeHtml(addr.full_name || '')}</div>
				<div class="address-lines">${escapeHtml(addr.address_line1 || addr.address || '')}</div>
				${addr.address_line2 ? `<div class=\"address-lines\">${escapeHtml(addr.address_line2)}</div>` : ''}
				<div class="address-phone">${escapeHtml(addr.phone || '')}</div>
			</div>
		`;
	}).join('');

	listEl.innerHTML = cardsHtml;

	listEl.querySelectorAll('.address-card').forEach(card => {
		card.addEventListener('click', () => selectAddressCard(card));
		card.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectAddressCard(card); }});
	});

    // Auto-select default address if present
    const defaultCard = listEl.querySelector('.address-card .badge-default')?.parentElement;
    if (defaultCard) {
        selectAddressCard(defaultCard);
    }

	const refreshBtn = document.getElementById('refresh-addresses-btn');
	if (refreshBtn && !refreshBtn._bound) {
		refreshBtn.addEventListener('click', loadAddresses);
		refreshBtn._bound = true;
	}
	const addBtn = document.getElementById('add-address-btn');
	if (addBtn && !addBtn._bound) {
		addBtn.addEventListener('click', () => {
			alert('Address creation UI not implemented yet.');
		});
		addBtn._bound = true;
	}

	const modal = document.getElementById('checkout-modal');
	const cancelBtn = document.getElementById('cancel-checkout-btn');
	if (cancelBtn && !cancelBtn._bound) {
		cancelBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
		cancelBtn._bound = true;
	}

	if (confirmBtn && !confirmBtn._bound) {
		confirmBtn.addEventListener('click', async () => {
			if (!selectedAddressId) {
				if (errorEl) { errorEl.textContent = 'Please select an address.'; errorEl.style.display = 'block'; }
				return;
			}
            alert("confirm cliked");
			if (errorEl) errorEl.style.display = 'none';
			const selected = addresses.find(a => String(a.id) === String(selectedAddressId));
			const customerDetails = {
                full_name: selected.full_name || '',
                address: [selected.address_line1 || selected.address || '', selected.address_line2 || '']
                          .filter(Boolean).join(', '),
                phone: selected.phone || ''
              };
			const methodEl = document.querySelector('input[name="payment_method"]:checked');
			const paymentMethod = methodEl ? methodEl.value : 'Cash on Delivery';
			const res = await placeOrder(customerDetails, paymentMethod);
			if (res && res.success) {
				alert('Order placed successfully!');
				if (modal) modal.style.display = 'none';
				loadCartData();
			} else {
				alert('Failed to place order: ' + (res && res.message ? res.message : 'Unknown error'));
			}
		});
		confirmBtn._bound = true;
	}
}

function selectAddressCard(cardEl) {
	const confirmBtn = document.getElementById('confirm-order-btn');
	document.querySelectorAll('.address-card').forEach(el => el.classList.remove('selected'));
	cardEl.classList.add('selected');
	selectedAddressId = cardEl.getAttribute('data-id');
	if (confirmBtn) confirmBtn.disabled = false;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

