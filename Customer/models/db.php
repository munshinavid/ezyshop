<?php
class Database {
    private $host = 'localhost';
    private $db_name = 'ecomm';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->db_name);

        if ($this->conn->connect_error) {
            throw new Exception("Error in DB connection", 1);
            
        }
    }

    // Execute a SELECT query and return results
    public function select($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            throw new Exception("Error in DB select", 1);
            
        }
    
        if (!empty($params)) {
            $this->bindParams($stmt, $params);
        }
    
        $stmt->execute();
        $result = $stmt->get_result();
    
        // Fetch data row by row using fetch_assoc
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    
        $stmt->close();
        return $data;
    }
    

    // Execute an INSERT/UPDATE/DELETE query
    public function execute($query, $params = []) {
        $stmt = $this->conn->prepare($query);
        if ($stmt === false) {
            //make actual error in json response
            throw new Exception("Error Processing execute", 1);
            
        }

        if (!empty($params)) {
            $this->bindParams($stmt, $params);
        }

        $success = $stmt->execute();
        if ($stmt->affected_rows === -1) {
            throw new Exception("Error Processing Request", 1);
            
        }
        $stmt->close();
        return $success;
    }

    // Insert wrapper
    public function insert($query, $params = []) {
        $this->execute($query, $params);
        return $this->getLastInsertId();
    }

    // Update wrapper
    public function update($query, $params = []) {
        return $this->execute($query, $params);
    }

    // Delete wrapper
    public function delete($query, $params = []) {
        return $this->execute($query, $params);
    }

    // Bind parameters to the prepared statement
    private function bindParams($stmt, $params) {
        $types = '';
        foreach ($params as $param) {
            if (is_int($param)) {
                $types .= 'i';
            } elseif (is_double($param)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        $stmt->bind_param($types, ...$params);
    }

    // Get the last inserted ID
    public function getLastInsertId() {
        return $this->conn->insert_id;
    }

    // Transaction controls
    public function beginTransaction() {
        $this->conn->begin_transaction();
    }

    public function commit() {
        $this->conn->commit();
    }

    public function rollback() {
        $this->conn->rollback();
    }

    // Close the connection
    public function close() {
        $this->conn->close();
    }
}
/*
here my db schema
-- ROLES TABLE
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

 
-- USERS TABLE
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);
 
-- VENDORS (For Brand Managers / Sellers)
CREATE TABLE Vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
-- DISCOUNTS
CREATE TABLE Discounts (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);
 
-- ✅ CATEGORIES (NEW TABLE)
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);
 
-- PRODUCTS (with category_id instead of plain text)
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    category_id INT DEFAULT NULL,
    discount_id INT DEFAULT NULL,
    vendor_id INT DEFAULT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (discount_id) REFERENCES Discounts(discount_id) ON DELETE SET NULL,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(vendor_id) ON DELETE SET NULL
);
 
-- ORDERS
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled') NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
 
-- ORDER ITEMS
CREATE TABLE Order_Items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);
 
-- SHIPPING
CREATE TABLE Shipping (
    shipping_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    shipping_status ENUM('Pending', 'Shipped', 'Delivered') NOT NULL,
    tracking_number VARCHAR(100),
    handled_by INT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES Users(user_id) ON DELETE SET NULL
);
 
-- RETURNS
CREATE TABLE Returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handled_by INT DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES Users(user_id) ON DELETE SET NULL
);
 
-- CART
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
 
-- CART ITEMS
CREATE TABLE Cart_Items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES Cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);
 
-- CUSTOMER DETAILS
CREATE TABLE CustomerDetails (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
 
-- PAYMENTS
CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('Cash on Delivery', 'Credit Card', 'Mobile Banking') NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);
*/