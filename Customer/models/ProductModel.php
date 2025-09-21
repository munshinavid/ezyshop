<?php
require_once 'db.php'; // Adjust the path based on your project structure

class ProductModel {
    private $db;

    public function __construct() {
        $this->db = new Database(); // Instantiate the DB class
    }

    public function getPaginatedProducts($limit, $offset) {
        $query = "SELECT * FROM products LIMIT ? OFFSET ?";
        return $this->db->select($query, [$limit, $offset]);
    }
}
