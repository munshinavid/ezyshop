<?php
// Include the Database class
require_once '../models/db.php';

session_start();

// Create an instance of the Database class
$db = new Database();

if ($_GET['action'] == 'placeOrder') {
    placeOrder($db);
} elseif ($_GET['action'] == 'clearCart') {
    clearCart($db);
}

// Place Order Function (No order details insertion)
function placeOrder($db) {
    $userId = $_SESSION['user_id'];
    $totalAmount = isset($_GET['total_amount']) ? floatval(str_replace(',', '', $_GET['total_amount'])) : 0;

    if ($totalAmount <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid total amount']);
        return;
    }

    // Insert order
    $query = "INSERT INTO orders (customer_id, total_amount, order_status) VALUES (?, ?, ?)";
    $orderInserted = $db->execute($query, [$userId, $totalAmount, 'Pending']);

    if ($orderInserted) {
        // Clear cart silently (without extra output)
        clearCart($db, false);

        echo json_encode(['success' => true, 'message' => 'Order placed successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to place the order']);
    }
}


// Clear Cart Function
function clearCart($db, $outputJson = true) {
    $userId = $_SESSION['user_id'];
    $query = "DELETE FROM cart WHERE customer_id = ?";
    $db->execute($query, [$userId]);

    // Clear home page cart data
    $_SESSION['cart_count'] = 0;
    $_SESSION['cart_total'] = 0.00;

    if ($outputJson) {
        echo json_encode(['success' => true, 'message' => 'Cart cleared']);
    }
}

?>
