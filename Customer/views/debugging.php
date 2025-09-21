<?php
require_once '../models/OrderModel.php';
require_once '../models/UserModel.php';
session_start();

// if (!isset($_SESSION['user_id'])) {
//     header('Location: ../index.php');
//     exit();
// }

$orderModel = new OrderModel();
$userModel = new UserModel();
$orders = $orderModel->getAllOrders($_SESSION['user_id']); // Fetch all orders
$user = $userModel->getUserById($_SESSION['user_id']);
$customerDetails = $userModel->getCustomerDetails(1); // Fetch customer details
var_dump($customerDetails);
?>