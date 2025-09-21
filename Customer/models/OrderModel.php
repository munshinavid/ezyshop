<?php
require_once 'db.php';

class OrderModel {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    // Method to get orders by user ID
    public function getOrdersByUserId($userId) {
        $query = "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC"; // Assuming 'orders' has 'user_id' and 'order_date'
        $result = $this->db->select($query, [$userId]);
        return $result;
    }

    // Method to get a specific order by order ID
    public function getOrderById($orderId) {
        $query = "SELECT * FROM orders WHERE order_id = ?";
        $result = $this->db->select($query, [$orderId]);
        return $result ? $result[0] : null;
    }

    public function getAllOrders($userId) {
        $sql = "SELECT o.order_id, o.created_at, o.total_amount, 
                       s.shipping_status 
                FROM Orders o
                LEFT JOIN Shipping s ON o.order_id = s.order_id
                WHERE o.customer_id = ?
                ORDER BY o.created_at DESC";


        return $this->db->select($sql, [$userId]);
    }
}
?>
