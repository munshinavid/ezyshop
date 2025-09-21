<?php
// test_controller.php - Simple test to check if controller is working
header('Content-Type: application/json');

// Check if db.php exists
$dbPath = '../models/db.php';
if (!file_exists($dbPath)) {
    echo json_encode([
        'error' => 'Database file not found at: ' . $dbPath,
        'current_dir' => __DIR__,
        'files_in_dir' => scandir(__DIR__)
    ]);
    exit;
}

// Add this after the existing code in test_controller.php
if ($_GET['path'] === 'describe') {
    $productColumns = $db->select("DESCRIBE products");
    echo json_encode([
        'success' => true,
        'product_columns' => $productColumns
    ]);
    exit;
}

// Try to include the database class
try {
    require_once $dbPath;
    
    // Test database connection
    $db = new Database();
    
    // Test simple query
    $tables = $db->select("SHOW TABLES");
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'tables' => $tables,
        'path_received' => $_GET['path'] ?? 'no path parameter'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
?>