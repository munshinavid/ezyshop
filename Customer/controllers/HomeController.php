<?php
// HomeController.php - RESTful API Controller for ezyCommerce
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log errors for debugging
function logError($message) {
    error_log(date('[Y-m-d H:i:s] ') . "API Error: " . $message . "\n", 3, 'api_errors.log');
}

// Include database class
require_once '../models/db.php';

class RESTfulAPIController {
    private $db;
    private $method;
    private $path;
    private $pathSegments;
    
    public function __construct() {
        try {
            $this->db = new Database();
            $this->method = $_SERVER['REQUEST_METHOD'];
            $this->parsePath();
        } catch (Exception $e) {
            logError("Database connection failed: " . $e->getMessage());
            $this->sendError('Database connection failed: ' . $e->getMessage(), 500);
        }
    }
    
    private function parsePath() {
        $uri = $_SERVER['REQUEST_URI'];
        $script = $_SERVER['SCRIPT_NAME'];
        $this->path = trim(str_replace($script, '', $uri), '/');
        
        // Remove query string
        if (($pos = strpos($this->path, '?')) !== false) {
            $this->path = substr($this->path, 0, $pos);
        }
        
        $this->pathSegments = array_filter(explode('/', $this->path));
        $this->pathSegments = array_values($this->pathSegments); // Reindex
    }
    
    public function handleRequest() {
        try {
            if (empty($this->pathSegments)) {
                $this->sendError("Invalid endpoint", 404);
                return;
            }
            
            $resource = $this->pathSegments[0];
            
            switch ($resource) {
                case 'categories':
                    $this->handleCategories();
                    break;
                case 'products':
                    $this->handleProducts();
                    break;
                case 'customers':
                    $this->handleCustomers();
                    break;
                case 'users':
                    $this->handleUsers();
                    break;
                case 'newsletter':
                    $this->handleNewsletter();
                    break;
                default:
                    $this->sendError("Invalid endpoint: $resource", 404);
                    break;
            }
        } catch (Exception $e) {
            logError("HandleRequest Exception: " . $e->getMessage());
            $this->sendError('Internal server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Handle /categories
    private function handleCategories() {
        if ($this->method !== 'GET') {
            $this->sendError('Method not allowed', 405);
            return;
        }
        
        $this->getCategories();
    }
    
    // Handle /products and /products/{id}
    private function handleProducts() {
        if ($this->method !== 'GET') {
            $this->sendError('Method not allowed', 405);
            return;
        }
        
        if (count($this->pathSegments) === 1) {
            // GET /products
            $this->getProducts();
        } elseif (count($this->pathSegments) === 2) {
            // GET /products/{id}
            $productId = $this->pathSegments[1];
            $this->getProduct($productId);
        } else {
            $this->sendError('Invalid products endpoint', 404);
        }
    }
    
    // Handle /customers/{customerId}/cart/*
    private function handleCustomers() {
        if (count($this->pathSegments) < 3) {
            $this->sendError('Invalid customers endpoint', 404);
            return;
        }
        
        $customerId = $this->pathSegments[1];
        $resource = $this->pathSegments[2];
        
        if ($resource === 'cart') {
            $this->handleCustomerCart($customerId);
        } else {
            $this->sendError('Invalid customers resource', 404);
        }
    }
    
    // Handle /users/{userId}/wishlist/*
    private function handleUsers() {
        if (count($this->pathSegments) < 3) {
            $this->sendError('Invalid users endpoint', 404);
            return;
        }
        
        $userId = $this->pathSegments[1];
        $resource = $this->pathSegments[2];
        
        if ($resource === 'wishlist') {
            $this->handleUserWishlist($userId);
        } else {
            $this->sendError('Invalid users resource', 404);
        }
    }
    
    // Handle customer cart operations
    private function handleCustomerCart($customerId) {
        switch ($this->method) {
            case 'GET':
                if (count($this->pathSegments) === 4 && $this->pathSegments[3] === 'count') {
                    // GET /customers/{customerId}/cart/count
                    $this->getCartCount($customerId);
                } else {
                    // GET /customers/{customerId}/cart
                    $this->getCart($customerId);
                }
                break;
            case 'POST':
                // POST /customers/{customerId}/cart
                $this->addToCart($customerId);
                break;
            case 'PUT':
                if (count($this->pathSegments) === 4) {
                    // PUT /customers/{customerId}/cart/{itemId}
                    $cartItemId = $this->pathSegments[3];
                    $this->updateCartItem($cartItemId);
                } else {
                    $this->sendError('Cart item ID required for update', 400);
                }
                break;
            case 'DELETE':
                if (count($this->pathSegments) === 4) {
                    // DELETE /customers/{customerId}/cart/{itemId}
                    $cartItemId = $this->pathSegments[3];
                    $this->removeFromCart($cartItemId);
                } else {
                    $this->sendError('Cart item ID required for deletion', 400);
                }
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    // Handle user wishlist operations
    private function handleUserWishlist($userId) {
        switch ($this->method) {
            case 'GET':
                if (count($this->pathSegments) === 4 && $this->pathSegments[3] === 'count') {
                    // GET /users/{userId}/wishlist/count
                    $this->getWishlistCount($userId);
                } else {
                    // GET /users/{userId}/wishlist
                    $this->getWishlist($userId);
                }
                break;
            case 'POST':
                // POST /users/{userId}/wishlist
                $this->addToWishlist($userId);
                break;
            case 'DELETE':
                if (count($this->pathSegments) === 4) {
                    // DELETE /users/{userId}/wishlist/{productId}
                    $productId = $this->pathSegments[3];
                    $this->removeFromWishlist($userId, $productId);
                } else {
                    $this->sendError('Product ID required for wishlist removal', 400);
                }
                break;
            default:
                $this->sendError('Method not allowed', 405);
        }
    }
    
    // Handle newsletter
    private function handleNewsletter() {
        if (count($this->pathSegments) === 2 && $this->pathSegments[1] === 'subscriptions') {
            if ($this->method === 'POST') {
                $this->subscribeNewsletter();
            } else {
                $this->sendError('Method not allowed', 405);
            }
        } else {
            $this->sendError('Invalid newsletter endpoint', 404);
        }
    }
    
    // Get all categories
    private function getCategories() {
        try {
            $categories = $this->db->select("
                SELECT category_id, category_name 
                FROM categories 
                ORDER BY category_name
            ");
            
            $this->sendResponse([
                'success' => true,
                'categories' => $categories
            ]);
        } catch (Exception $e) {
            logError("Categories error: " . $e->getMessage());
            $this->sendError('Failed to load categories: ' . $e->getMessage());
        }
    }
    
    // Get products with filtering, sorting, and pagination
    private function getProducts() {
        try {
            $page = intval($_GET['page'] ?? 1);
            $limit = intval($_GET['limit'] ?? 8);
            $filter = $_GET['filter'] ?? 'all';
            $sort = $_GET['sort'] ?? 'newest';
            $category = $_GET['category'] ?? '';
            $search = $_GET['search'] ?? '';
            
            $offset = ($page - 1) * $limit;
            
            // Build WHERE clause
            $whereClauses = [];
            $params = [];
            
            // Category filter
            if (!empty($category)) {
                $whereClauses[] = "c.category_name = ?";
                $params[] = $category;
            }
            
            // Search filter
            if (!empty($search)) {
                $whereClauses[] = "(p.name LIKE ? OR p.description LIKE ? OR c.category_name LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            // Product filter
            switch ($filter) {
                case 'sale':
                    $whereClauses[] = "p.discount_id IS NOT NULL";
                    break;
                case 'in-stock':
                    $whereClauses[] = "p.stock > 0";
                    break;
                case 'out-of-stock':
                    $whereClauses[] = "p.stock = 0";
                    break;
            }
            
            $whereClause = !empty($whereClauses) ? 'WHERE ' . implode(' AND ', $whereClauses) : '';
            
            // Build ORDER BY clause
            $orderBy = 'ORDER BY ';
            switch ($sort) {
                case 'price-low':
                    $orderBy .= 'p.price ASC';
                    break;
                case 'price-high':
                    $orderBy .= 'p.price DESC';
                    break;
                case 'name':
                    $orderBy .= 'p.name ASC';
                    break;
                case 'newest':
                default:
                    $orderBy .= 'p.product_id DESC';
                    break;
            }
            
            // Get total count for pagination
            $countQuery = "
                SELECT COUNT(*) as total 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN discounts d ON p.discount_id = d.discount_id
                $whereClause
            ";
            $countResult = $this->db->select($countQuery, $params);
            $totalProducts = $countResult[0]['total'];
            $totalPages = ceil($totalProducts / $limit);
            
            // Get products
            $productsQuery = "
                SELECT 
                    p.product_id,
                    p.name,
                    p.description,
                    p.price,
                    CASE 
                        WHEN d.discount_type = 'percentage' THEN p.price / (1 - d.discount_value/100)
                        WHEN d.discount_type = 'fixed' THEN p.price + d.discount_value
                        ELSE p.price
                    END as original_price,
                    c.category_name,
                    p.image_url,
                    p.stock,
                    0 as rating,
                    0 as review_count,
                    CASE WHEN p.discount_id IS NOT NULL THEN 1 ELSE 0 END as is_featured,
                    (p.stock > 0) as in_stock,
                    CASE 
                        WHEN p.discount_id IS NOT NULL THEN 'sale'
                        ELSE NULL
                    END as badge
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN discounts d ON p.discount_id = d.discount_id
                $whereClause 
                $orderBy 
                LIMIT ? OFFSET ?
            ";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $products = $this->db->select($productsQuery, $params);
            
            // Format products
            foreach ($products as &$product) {
                $product['price'] = floatval($product['price']);
                $product['original_price'] = floatval($product['original_price']);
                $product['rating'] = 4.5;
                $product['review_count'] = rand(10, 200);
                $product['stock'] = intval($product['stock']);
                $product['in_stock'] = $product['stock'] > 0;
                
                if (empty($product['image_url'])) {
                    $product['image_url'] = 'https://via.placeholder.com/300x200?text=No+Image';
                }
            }
            
            $this->sendResponse([
                'success' => true,
                'products' => $products,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => $totalPages,
                    'total_items' => $totalProducts,
                    'items_per_page' => $limit
                ]
            ]);
            
        } catch (Exception $e) {
            logError("Products error: " . $e->getMessage());
            $this->sendError('Failed to load products: ' . $e->getMessage());
        }
    }
    
    // Get single product
    private function getProduct($productId) {
        try {
            $products = $this->db->select("
                SELECT 
                    p.product_id,
                    p.name,
                    p.description,
                    p.price,
                    CASE 
                        WHEN d.discount_type = 'percentage' THEN p.price / (1 - d.discount_value/100)
                        WHEN d.discount_type = 'fixed' THEN p.price + d.discount_value
                        ELSE p.price
                    END as original_price,
                    c.category_name,
                    p.image_url,
                    p.stock,
                    0 as rating,
                    0 as review_count,
                    CASE WHEN p.discount_id IS NOT NULL THEN 1 ELSE 0 END as is_featured,
                    (p.stock > 0) as in_stock
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.category_id 
                LEFT JOIN discounts d ON p.discount_id = d.discount_id
                WHERE p.product_id = ?
            ", [$productId]);
            
            if (empty($products)) {
                $this->sendError('Product not found', 404);
                return;
            }
            
            $product = $products[0];
            $product['price'] = floatval($product['price']);
            $product['original_price'] = floatval($product['original_price']);
            $product['rating'] = 4.5;
            $product['review_count'] = rand(10, 200);
            $product['stock'] = intval($product['stock']);
            $product['in_stock'] = $product['stock'] > 0;
            
            if (empty($product['image_url'])) {
                $product['image_url'] = 'https://via.placeholder.com/300x200?text=No+Image';
            }
            
            $this->sendResponse([
                'success' => true,
                'product' => $product
            ]);
            
        } catch (Exception $e) {
            $this->sendError('Failed to load product: ' . $e->getMessage());
        }
    }
    
    // Get cart items
    private function getCart($customerId) {
        // Get or create cart
        $carts = $this->db->select("SELECT cart_id FROM cart WHERE customer_id = ?", [$customerId]);
        
        if (empty($carts)) {
            $this->db->insert("INSERT INTO cart (customer_id) VALUES (?)", [$customerId]);
            $cartId = $this->db->getLastInsertId();
        } else {
            $cartId = $carts[0]['cart_id'];
        }
        
        // Get cart items
        $cartItems = $this->db->select("
            SELECT 
                ci.cart_item_id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.image_url,
                p.stock,
                (p.price * ci.quantity) as total
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = ?
            ORDER BY ci.cart_item_id DESC
        ", [$cartId]);
        
        $this->sendResponse([
            'success' => true,
            'cart_items' => $cartItems
        ]);
    }
    
    // Add item to cart
    private function addToCart($customerId) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $productId = $input['product_id'] ?? null;
        $quantity = $input['quantity'] ?? 1;
        
        if (!$productId) {
            $this->sendError('Product ID required');
            return;
        }
        
        // Check product availability
        $products = $this->db->select("SELECT stock, name FROM products WHERE product_id = ?", [$productId]);
        
        if (empty($products)) {
            $this->sendError('Product not found');
            return;
        }
        
        if ($products[0]['stock'] < $quantity) {
            $this->sendError('Insufficient stock available');
            return;
        }
        
        // Get or create cart
        $carts = $this->db->select("SELECT cart_id FROM cart WHERE customer_id = ?", [$customerId]);
        
        if (empty($carts)) {
            $this->db->insert("INSERT INTO cart (customer_id) VALUES (?)", [$customerId]);
            $cartId = $this->db->getLastInsertId();
        } else {
            $cartId = $carts[0]['cart_id'];
        }
        
        // Check if item already exists
        $existingItems = $this->db->select("
            SELECT cart_item_id, quantity 
            FROM cart_items 
            WHERE cart_id = ? AND product_id = ?
        ", [$cartId, $productId]);
        
        if (!empty($existingItems)) {
            // Update quantity
            $newQuantity = $existingItems[0]['quantity'] + $quantity;
            $this->db->update("
                UPDATE cart_items 
                SET quantity = ? 
                WHERE cart_item_id = ?
            ", [$newQuantity, $existingItems[0]['cart_item_id']]);
        } else {
            // Add new item
            $this->db->insert("
                INSERT INTO cart_items (cart_id, product_id, quantity) 
                VALUES (?, ?, ?)
            ", [$cartId, $productId, $quantity]);
        }
        
        // Get updated cart count
        $cartCount = $this->getCartCountForCustomer($customerId);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Item added to cart successfully',
            'cart_count' => $cartCount
        ]);
    }
    
    // Update cart item quantity
    private function updateCartItem($cartItemId) {
        $input = json_decode(file_get_contents('php://input'), true);
        $quantity = $input['quantity'] ?? null;
        
        if (!$quantity || $quantity < 1) {
            $this->sendError('Valid quantity required');
            return;
        }
        
        $this->db->update("UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?", [$quantity, $cartItemId]);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Cart updated successfully'
        ]);
    }
    
    // Remove item from cart
    private function removeFromCart($cartItemId) {
        $this->db->delete("DELETE FROM cart_items WHERE cart_item_id = ?", [$cartItemId]);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
    }
    
    // Get cart count
    private function getCartCount($customerId) {
        $cartCount = $this->getCartCountForCustomer($customerId);
        
        $this->sendResponse([
            'success' => true,
            'cart_count' => $cartCount
        ]);
    }
    
    // Helper function to get cart count for a customer
    private function getCartCountForCustomer($customerId) {
        $result = $this->db->select("
            SELECT COALESCE(SUM(ci.quantity), 0) as cart_count
            FROM cart c
            LEFT JOIN cart_items ci ON c.cart_id = ci.cart_id
            WHERE c.customer_id = ?
        ", [$customerId]);
        
        return intval($result[0]['cart_count']);
    }
    
    // Get wishlist items
    private function getWishlist($userId) {
        $wishlistItems = $this->db->select("
            SELECT 
                w.wishlist_id,
                w.product_id,
                p.name,
                p.price,
                p.image_url,
                p.stock
            FROM wishlist w
            JOIN products p ON w.product_id = p.product_id
            WHERE w.user_id = ?
            ORDER BY w.added_at DESC
        ", [$userId]);
        
        $this->sendResponse([
            'success' => true,
            'wishlist_items' => $wishlistItems
        ]);
    }
    
    // Add to wishlist
    private function addToWishlist($userId) {
        $input = json_decode(file_get_contents('php://input'), true);
        $productId = $input['product_id'] ?? null;
        
        if (!$productId) {
            $this->sendError('Product ID required');
            return;
        }
        
        // Check if already in wishlist
        $existing = $this->db->select("
            SELECT wishlist_id 
            FROM wishlist 
            WHERE user_id = ? AND product_id = ?
        ", [$userId, $productId]);
        
        if (!empty($existing)) {
            $this->sendError('Item already in wishlist');
            return;
        }
        
        $this->db->insert("
            INSERT INTO wishlist (user_id, product_id) 
            VALUES (?, ?)
        ", [$userId, $productId]);
        
        $wishlistCount = $this->getWishlistCountForUser($userId);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Item added to wishlist',
            'wishlist_count' => $wishlistCount
        ]);
    }
    
    // Remove from wishlist
    private function removeFromWishlist($userId, $productId) {
        $this->db->delete("
            DELETE FROM wishlist 
            WHERE user_id = ? AND product_id = ?
        ", [$userId, $productId]);
        
        $wishlistCount = $this->getWishlistCountForUser($userId);
        
        $this->sendResponse([
            'success' => true,
            'message' => 'Item removed from wishlist',
            'wishlist_count' => $wishlistCount
        ]);
    }
    
    // Get wishlist count
    private function getWishlistCount($userId) {
        $wishlistCount = $this->getWishlistCountForUser($userId);
        
        $this->sendResponse([
            'success' => true,
            'wishlist_count' => $wishlistCount
        ]);
    }
    
    // Helper function to get wishlist count for a user
    private function getWishlistCountForUser($userId) {
        $result = $this->db->select("
            SELECT COUNT(*) as wishlist_count
            FROM wishlist
            WHERE user_id = ?
        ", [$userId]);
        
        return intval($result[0]['wishlist_count']);
    }
    
    // Handle newsletter subscription
    private function subscribeNewsletter() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? null;
        
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->sendError('Valid email required');
            return;
        }
        
        try {
            $this->sendResponse([
                'success' => true,
                'message' => 'Successfully subscribed to newsletter'
            ]);
            
        } catch (Exception $e) {
            $this->sendError('Newsletter subscription failed: ' . $e->getMessage());
        }
    }
    
    // Send success response
    private function sendResponse($data) {
        echo json_encode($data);
        exit();
    }
    
    // Send error response
    private function sendError($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit();
    }
}

// Initialize and handle request
$controller = new RESTfulAPIController();
$controller->handleRequest();
?>