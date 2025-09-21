<?php
require_once 'db.php';

class CartModel {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    public function getCartItems($userId) {
        $query = "SELECT ci.cart_item_id, p.name, p.price, p.image_url, ci.quantity
                  FROM Cart_Items ci
                  JOIN Products p ON ci.product_id = p.product_id
                  WHERE ci.cart_id = (SELECT cart_id FROM Cart WHERE customer_id = ?)";
        return $this->db->select($query, [$userId]);
    }

    public function addToCart($userId, $productId) {
        // Get or create the user's cart
        $query = "SELECT cart_id FROM Cart WHERE customer_id = ?";
        $cart = $this->db->select($query, [$userId]);

        if (empty($cart)) {
            // Create a new cart if none exists
            $query = "INSERT INTO Cart (customer_id) VALUES (?)";
            $this->db->execute($query, [$userId]);
            $cartId = $this->db->getLastInsertId();
        } else {
            $cartId = $cart[0]['cart_id'];
        }

        // Check if the product already exists in the cart
        $query = "SELECT cart_item_id FROM Cart_Items WHERE cart_id = ? AND product_id = ?";
        $existingItem = $this->db->select($query, [$cartId, $productId]);

        if (!empty($existingItem)) {
            // Update quantity if product exists
            $query = "UPDATE Cart_Items SET quantity = quantity + 1 WHERE cart_id = ? AND product_id = ?";
            return $this->db->execute($query, [$cartId, $productId]);
        } else {
            // Add new product to cart
            $query = "INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, 1)";
            return $this->db->execute($query, [$cartId, $productId]);
        }
    }

    public function removeFromCart($cartItemId) {
        $query = "DELETE FROM Cart_Items WHERE cart_item_id = ?";
        return $this->db->execute($query, [$cartItemId]);
    }

    public function updateQuantity($cartItemId, $quantity) {
        $query = "UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?";
        return $this->db->execute($query, [$quantity, $cartItemId]);
    }
}
?>
