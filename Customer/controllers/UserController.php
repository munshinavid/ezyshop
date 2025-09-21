<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../models/db.php';

class UserController {
    private $db;
    private $user_id;
    
    public function __construct() {
        $this->db = new Database();
        $this->user_id = $this->getUserIdFromToken();
    }
    
    public function handleRequest() {
        // Get endpoint from query parameters instead of URI
        $endpoint = $_GET['endpoint'] ?? null;
        $id = $_GET['id'] ?? null;
        $method = $_GET['method'] ?? $_SERVER['REQUEST_METHOD'];
        
        if (!$endpoint) {
            $this->sendResponse(['error' => 'Endpoint parameter is required'], 400);
            return;
        }
        
        switch ($endpoint) {
            case 'dashboard':
                if ($method === 'GET') {
                    $this->getDashboard();
                } else {
                    $this->sendResponse(['error' => 'Method not allowed for dashboard'], 405);
                }
                break;
                
            case 'orders':
                if ($method === 'GET') {
                    $this->getOrders();
                    alert("orders");
                } else {
                    $this->sendResponse(['error' => 'Method not allowed for orders'], 405);
                }
                break;
                
            case 'addresses':
                switch ($method) {
                    case 'GET':
                        if ($id) {
                            $this->getAddress($id);
                        } else {
                            $this->getAddresses();
                        }
                        break;
                    case 'POST':
                        $this->createAddress();
                        break;
                    case 'PUT':
                        if ($id) {
                            $this->updateAddress($id);
                        } else {
                            $this->sendResponse(['error' => 'ID required for address update'], 400);
                        }
                        break;
                    case 'DELETE':
                        if ($id) {
                            $this->deleteAddress($id);
                        } else {
                            $this->sendResponse(['error' => 'ID required for address deletion'], 400);
                        }
                        break;
                    default:
                        $this->sendResponse(['error' => 'Method not allowed for addresses'], 405);
                }
                break;
                
            case 'profile':
                switch ($method) {
                    case 'GET':
                        $this->getProfile();
                        break;
                    case 'PUT':
                        $this->updateProfile();
                        break;
                    default:
                        $this->sendResponse(['error' => 'Method not allowed for profile'], 405);
                }
                break;
                
            case 'wishlist':
                switch ($method) {
                    case 'GET':
                        $this->getWishlist();
                        break;
                    case 'POST':
                        $this->addToWishlist();
                        break;
                    case 'DELETE':
                        if ($id) {
                            $this->removeFromWishlist($id);
                        } else {
                            $this->sendResponse(['error' => 'ID required for wishlist removal'], 400);
                        }
                        break;
                    default:
                        $this->sendResponse(['error' => 'Method not allowed for wishlist'], 405);
                }
                break;
                
            default:
                $this->sendResponse(['error' => 'Endpoint not found'], 404);
        }
    }
    
    private function getUserIdFromToken() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            $this->sendResponse(['error' => 'Authorization header missing'], 401);
            exit();
        }
        
        $token = trim(str_replace('Bearer ', '', $headers['Authorization'])); // Note the space
        
        // Use the same validation logic as AuthController
        if (strpos($token, 'demo-token-') === 0) {
            $parts = explode('-', $token);
            if (isset($parts[2])) {
                return intval($parts[2]); // Return user ID from token
            }
        }
        
        $this->sendResponse(['error' => 'Invalid token'], 401);
        exit();
   }
    
    public function getDashboard() {
        try {
            // Get total orders count
            $totalOrders = $this->db->select(
                "SELECT COUNT(*) as count FROM Orders WHERE customer_id = ?",
                [$this->user_id]
            )[0]['count'];
            
            // Get completed orders count
            $completedOrders = $this->db->select(
                "SELECT COUNT(*) as count FROM Orders WHERE customer_id = ? AND order_status = 'Delivered'",
                [$this->user_id]
            )[0]['count'];
            
            // Get wishlist items count
            $wishlistItems = $this->db->select(
                "SELECT COUNT(*) as count FROM Wishlist WHERE user_id = ?",
                [$this->user_id]
            )[0]['count'];
            
            // Get addresses count
            $addressesCount = $this->db->select(
                "SELECT COUNT(*) as count FROM CustomerDetails WHERE user_id = ?",
                [$this->user_id]
            )[0]['count'];
            
            // Get recent orders
            $recentOrders = $this->db->select(
                "SELECT order_id as id, order_status as status, total_amount as total, created_at as orderDate 
                 FROM Orders WHERE customer_id = ? 
                 ORDER BY created_at DESC LIMIT 5",
                [$this->user_id]
            );
            
            $stats = [
                'totalOrders' => (int)$totalOrders,
                'completedOrders' => (int)$completedOrders,
                'wishlistItems' => (int)$wishlistItems,
                'addressesCount' => (int)$addressesCount
            ];
            
            $this->sendResponse([
                'stats' => $stats,
                'recentOrders' => $recentOrders
            ]);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch dashboard data'], 500);
        }
    }
    
    public function getOrders() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            // Get total count for pagination
            $totalCount = $this->db->select(
                "SELECT COUNT(*) as count FROM Orders WHERE customer_id = ?",
                [$this->user_id]
            )[0]['count'];
            
            // Get orders with pagination
            $orders = $this->db->select(
                "SELECT order_id as id, order_status as status, total_amount as total, created_at as orderDate 
                 FROM Orders WHERE customer_id = ? 
                 ORDER BY created_at DESC LIMIT ? OFFSET ?",
                [$this->user_id, $limit, $offset]
            );
            
            $totalPages = ceil($totalCount / $limit);
            
            $pagination = [
                'currentPage' => $page,
                'totalPages' => (int)$totalPages,
                'totalItems' => (int)$totalCount,
                'itemsPerPage' => $limit
            ];
            
            $this->sendResponse([
                'orders' => $orders,
                'pagination' => $pagination
            ]);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch orders'], 500);
        }
    }
    
    public function getAddresses() {
        try {
            $addresses = $this->db->select(
                "SELECT detail_id as id, full_name, address as address_line1, '' as address_line2, 
                        '' as city, '' as state, '' as zip_code, '' as country, phone, 
                        CASE WHEN detail_id = (SELECT MIN(detail_id) FROM CustomerDetails WHERE user_id = ?) THEN 1 ELSE 0 END as is_default
                 FROM CustomerDetails WHERE user_id = ?",
                [$this->user_id, $this->user_id]
            );
            
            $this->sendResponse($addresses);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch addresses'], 500);
        }
    }
    
    public function getAddress($id) {
        try {
            $address = $this->db->select(
                "SELECT detail_id as id, full_name, address as address_line1, '' as address_line2, 
                        '' as city, '' as state, '' as zip_code, '' as country, phone, 
                        CASE WHEN detail_id = (SELECT MIN(detail_id) FROM CustomerDetails WHERE user_id = ?) THEN 1 ELSE 0 END as is_default,
                        'home' as type
                 FROM CustomerDetails WHERE detail_id = ? AND user_id = ?",
                [$this->user_id, $id, $this->user_id]
            );
            
            if (empty($address)) {
                $this->sendResponse(['error' => 'Address not found'], 404);
                return;
            }
            
            $this->sendResponse($address[0]);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch address'], 500);
        }
    }
    
    public function createAddress() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $this->sendResponse(['error' => 'Invalid JSON input'], 400);
                return;
            }
            
            $required_fields = ['full_name', 'address_line1', 'phone'];
            foreach ($required_fields as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    $this->sendResponse(['error' => "Field '$field' is required"], 400);
                    return;
                }
            }
            
            // Combine address fields into single address field for CustomerDetails table
            $full_address = $input['address_line1'];
            if (!empty($input['address_line2'])) {
                $full_address .= ', ' . $input['address_line2'];
            }
            if (!empty($input['city'])) {
                $full_address .= ', ' . $input['city'];
            }
            if (!empty($input['state'])) {
                $full_address .= ', ' . $input['state'];
            }
            if (!empty($input['zip_code'])) {
                $full_address .= ' ' . $input['zip_code'];
            }
            if (!empty($input['country'])) {
                $full_address .= ', ' . $input['country'];
            }
            
            $success = $this->db->execute(
                "INSERT INTO CustomerDetails (user_id, full_name, address, phone) VALUES (?, ?, ?, ?)",
                [$this->user_id, $input['full_name'], $full_address, $input['phone']]
            );
            
            if ($success) {
                $this->sendResponse(['message' => 'Address created successfully'], 201);
            } else {
                $this->sendResponse(['error' => 'Failed to create address'], 500);
            }
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to create address'], 500);
        }
    }
    
    public function updateAddress($id) {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $this->sendResponse(['error' => 'Invalid JSON input'], 400);
                return;
            }
            
            // Check if address exists and belongs to user
            $existing = $this->db->select(
                "SELECT detail_id FROM CustomerDetails WHERE detail_id = ? AND user_id = ?",
                [$id, $this->user_id]
            );
            
            if (empty($existing)) {
                $this->sendResponse(['error' => 'Address not found'], 404);
                return;
            }
            
            // Combine address fields
            $full_address = $input['address_line1'];
            if (!empty($input['address_line2'])) {
                $full_address .= ', ' . $input['address_line2'];
            }
            if (!empty($input['city'])) {
                $full_address .= ', ' . $input['city'];
            }
            if (!empty($input['state'])) {
                $full_address .= ', ' . $input['state'];
            }
            if (!empty($input['zip_code'])) {
                $full_address .= ' ' . $input['zip_code'];
            }
            if (!empty($input['country'])) {
                $full_address .= ', ' . $input['country'];
            }
            
            $success = $this->db->execute(
                "UPDATE CustomerDetails SET full_name = ?, address = ?, phone = ? WHERE detail_id = ? AND user_id = ?",
                [$input['full_name'], $full_address, $input['phone'], $id, $this->user_id]
            );
            
            if ($success) {
                $this->sendResponse(['message' => 'Address updated successfully']);
            } else {
                $this->sendResponse(['error' => 'Failed to update address'], 500);
            }
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to update address'], 500);
        }
    }
    
    public function deleteAddress($id) {
        try {
            // Check if address exists and belongs to user
            $existing = $this->db->select(
                "SELECT detail_id FROM CustomerDetails WHERE detail_id = ? AND user_id = ?",
                [$id, $this->user_id]
            );
            
            if (empty($existing)) {
                $this->sendResponse(['error' => 'Address not found'], 404);
                return;
            }
            
            $success = $this->db->execute(
                "DELETE FROM CustomerDetails WHERE detail_id = ? AND user_id = ?",
                [$id, $this->user_id]
            );
            
            if ($success) {
                $this->sendResponse(['message' => 'Address deleted successfully']);
            } else {
                $this->sendResponse(['error' => 'Failed to delete address'], 500);
            }
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to delete address'], 500);
        }
    }
    
    public function getProfile() {
        try {
            $user = $this->db->select(
                "SELECT user_id as id, username, email, created_at FROM Users WHERE user_id = ?",
                [$this->user_id]
            );
            
            if (empty($user)) {
                $this->sendResponse(['error' => 'User not found'], 404);
                return;
            }
            
            // Get additional details if available
            $details = $this->db->select(
                "SELECT full_name, phone FROM CustomerDetails WHERE user_id = ? LIMIT 1",
                [$this->user_id]
            );
            
            $profile = $user[0];
            if (!empty($details)) {
                $nameParts = explode(' ', $details[0]['full_name'], 2);
                $profile['firstName'] = $nameParts[0];
                $profile['lastName'] = isset($nameParts[1]) ? $nameParts[1] : '';
                $profile['phone'] = $details[0]['phone'];
            } else {
                $profile['firstName'] = '';
                $profile['lastName'] = '';
                $profile['phone'] = '';
            }
            
            $profile['avatar'] = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80';
            
            $this->sendResponse($profile);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch profile'], 500);
        }
    }
    
    public function updateProfile() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                $this->sendResponse(['error' => 'Invalid JSON input'], 400);
                return;
            }
            
            // Update Users table
            if (isset($input['email'])) {
                $this->db->execute(
                    "UPDATE Users SET email = ? WHERE user_id = ?",
                    [$input['email'], $this->user_id]
                );
            }
            
            // Handle password update
            if (isset($input['new_password']) && !empty($input['new_password'])) {
                if (!isset($input['current_password'])) {
                    $this->sendResponse(['error' => 'Current password is required'], 400);
                    return;
                }
                
                // Verify current password
                $currentUser = $this->db->select(
                    "SELECT password FROM Users WHERE user_id = ?",
                    [$this->user_id]
                );
                
                if (empty($currentUser) || !password_verify($input['current_password'], $currentUser[0]['password'])) {
                    $this->sendResponse(['error' => 'Current password is incorrect'], 400);
                    return;
                }
                
                // Update password
                $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);
                $this->db->execute(
                    "UPDATE Users SET password = ? WHERE user_id = ?",
                    [$hashedPassword, $this->user_id]
                );
            }
            
            // Update CustomerDetails table
            if (isset($input['first_name']) || isset($input['last_name']) || isset($input['phone'])) {
                $fullName = trim(($input['first_name'] ?? '') . ' ' . ($input['last_name'] ?? ''));
                
                // Check if customer details exist
                $existing = $this->db->select(
                    "SELECT detail_id FROM CustomerDetails WHERE user_id = ? LIMIT 1",
                    [$this->user_id]
                );
                
                if (!empty($existing)) {
                    // Update existing
                    $this->db->execute(
                        "UPDATE CustomerDetails SET full_name = ?, phone = ? WHERE user_id = ?",
                        [$fullName, $input['phone'] ?? '', $this->user_id]
                    );
                } else {
                    // Create new
                    $this->db->execute(
                        "INSERT INTO CustomerDetails (user_id, full_name, address, phone) VALUES (?, ?, ?, ?)",
                        [$this->user_id, $fullName, '', $input['phone'] ?? '']
                    );
                }
            }
            
            // Return updated profile
            $this->getProfile();
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to update profile'], 500);
        }
    }
    
    public function getWishlist() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            
            $wishlist = $this->db->select(
                "SELECT w.wishlist_id, w.added_at, p.product_id, p.name, p.price, p.image_url, p.stock
                 FROM Wishlist w 
                 JOIN Products p ON w.product_id = p.product_id 
                 WHERE w.user_id = ? 
                 ORDER BY w.added_at DESC 
                 LIMIT ? OFFSET ?",
                [$this->user_id, $limit, $offset]
            );
            
            $totalCount = $this->db->select(
                "SELECT COUNT(*) as count FROM Wishlist WHERE user_id = ?",
                [$this->user_id]
            )[0]['count'];
            
            $this->sendResponse([
                'items' => $wishlist,
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => ceil($totalCount / $limit),
                    'totalItems' => (int)$totalCount
                ]
            ]);
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to fetch wishlist'], 500);
        }
    }
    
    public function addToWishlist() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['product_id'])) {
                $this->sendResponse(['error' => 'Product ID is required'], 400);
                return;
            }
            
            // Check if already in wishlist
            $existing = $this->db->select(
                "SELECT wishlist_id FROM Wishlist WHERE user_id = ? AND product_id = ?",
                [$this->user_id, $input['product_id']]
            );
            
            if (!empty($existing)) {
                $this->sendResponse(['error' => 'Product already in wishlist'], 400);
                return;
            }
            
            $success = $this->db->execute(
                "INSERT INTO Wishlist (user_id, product_id) VALUES (?, ?)",
                [$this->user_id, $input['product_id']]
            );
            
            if ($success) {
                $this->sendResponse(['message' => 'Product added to wishlist'], 201);
            } else {
                $this->sendResponse(['error' => 'Failed to add to wishlist'], 500);
            }
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to add to wishlist'], 500);
        }
    }
    
    public function removeFromWishlist($productId) {
        try {
            $success = $this->db->execute(
                "DELETE FROM Wishlist WHERE user_id = ? AND product_id = ?",
                [$this->user_id, $productId]
            );
            
            if ($success) {
                $this->sendResponse(['message' => 'Product removed from wishlist']);
            } else {
                $this->sendResponse(['error' => 'Failed to remove from wishlist'], 500);
            }
            
        } catch (Exception $e) {
            $this->sendResponse(['error' => 'Failed to remove from wishlist'], 500);
        }
    }
    
    private function sendResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data);
        exit();
    }
}

// Handle the request
$controller = new UserController();
$controller->handleRequest();
?>