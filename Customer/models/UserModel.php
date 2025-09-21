<?php
require_once 'db.php';

class UserModel {
    private $db;

    public function __construct() {
        $this->db = new Database();
    }

    public function getUserById($userId) {
        $query = "SELECT * FROM users WHERE user_id = ?";
        $result = $this->db->select($query, [$userId]);
        return $result ? $result[0] : null;
    }

    //check duplicate email
    public function isEmailTaken($email, $userId) {
        $query = "SELECT user_id FROM users WHERE email = ? AND user_id != ?";
        $result = $this->db->select($query, [$email, $userId]);
        
        return !empty($result); // Returns true if email exists for another user
    }

    public function isEmailTaken2($email) {
        $query = "SELECT COUNT(*) FROM Users WHERE email = ?";
        $result = $this->db->select($query, [$email]);
        
        // If the result is greater than 0, the email is already taken
        return $result[0]['COUNT(*)'] > 0;
    }

    public function registerUser($username, $email, $password, $fullName, $phone, $billingAddress, $shippingAddress) {
        $query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        $result = $this->db->execute($query, [$username, $email, $password]);

        if ($result) {
            // Get the user_id of the inserted user
            $userId = $this->db->getLastInsertId();

            // Insert into CustomerDetails table
            $query = "INSERT INTO CustomerDetails (user_id, full_name, phone, billing_address, shipping_address) 
                      VALUES (?, ?, ?, ?, ?)";
            $this->db->execute($query, [$userId, $fullName, $phone, $billingAddress, $shippingAddress]);

            return true;
        }

        return false;
    }
    

    public function updateUser($userId, $username, $email, $newPassword = null) {
        // If a new password is provided, hash it before saving
        if ($newPassword) {
            $hashedPassword = $newPassword;
        } else {
            // If no new password is provided, retain the current password
            $currentPasswordQuery = "SELECT password FROM users WHERE user_id = ?";
            $currentPassword = $this->db->select($currentPasswordQuery, [$userId]);
    
            if ($currentPassword) {
                $hashedPassword = $currentPassword[0]['password'];
            } else {
                return false; // User not found
            }
        }
    
        // Prepare the update query for the user
        $query = "UPDATE users SET username = ?, email = ?, password = ? WHERE user_id = ?";
        $result = $this->db->execute($query, [$username, $email, $hashedPassword, $userId]);
    
        return $result ? true : false;
    }
    public function updateCustomerDetails($userId, $fullName, $phone, $billingAddress, $shippingAddress) {
        // Prepare the update query for customer details
        $query = "UPDATE CustomerDetails SET full_name = ?, phone = ?, billing_address = ?, shipping_address = ? WHERE user_id = ?";
        $result = $this->db->execute($query, [$fullName, $phone, $billingAddress, $shippingAddress, $userId]);
    
        return $result ? true : false;
    }
    
    

    public function getCustomerDetails($userId) {
        $query = "
                SELECT 
                    u.username,
                    u.email,
                    c.full_name,
                    c.phone,
                    c.billing_address,
                    c.shipping_address
                FROM 
                    Users u
                JOIN 
                    CustomerDetails c ON u.user_id = c.user_id
                WHERE 
                    u.user_id = ?;";
        $result = $this->db->select($query, [$userId]);
        return $result ? $result[0] : null;
    }
}
