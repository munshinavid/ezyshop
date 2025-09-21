<?php
header('Content-Type: application/json');

// Simple test response
$response = [
    "status" => "success",
    "message" => "PHP is working and test.php is reachable!",
    "timestamp" => date("Y-m-d H:i:s")
];

// Optional: test database connection
require_once __DIR__ . "/Customer/models/db.php";

try {
    $db = new Database();
    $response["db"] = "Database connection successful!";
} catch (Exception $e) {
    $response["db"] = "Database connection failed: " . $e->getMessage();
}

echo json_encode($response);
