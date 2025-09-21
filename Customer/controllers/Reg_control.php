<?php
require_once '../models/UserModel.php';

session_start();

// Get user inputs from the form
$username = $_POST['username'];
$email = $_POST['email'];
$password = $_POST['password'];
$fullName = $_POST['full_name'];
$phone = $_POST['phone'];
$billingAddress = $_POST['billing_address'];
$shippingAddress = $_POST['shipping_address'];

// Basic backend validation
if (empty($username) || empty($email) || empty($password) || empty($fullName) || empty($phone) || empty($billingAddress) || empty($shippingAddress)) {
    $_SESSION['error_message'] = "All fields are required.";
    header("Location: ../views/customer_registration.php");
    exit();
}

// Check if the email is already taken
$userModel = new UserModel();
if ($userModel->isEmailTaken2($email)) {
    $_SESSION['error_message'] = "This email is already registered. Please use a different email.";
    header("Location: ../views/customer_registration.php");
    exit();
}



// Register the new customer in the database
$isRegistered = $userModel->registerUser($username, $email, $password, $fullName, $phone, $billingAddress, $shippingAddress);

if ($isRegistered) {
    $_SESSION['success_message'] = "Registration successful! You can now log in.";
    header("Location: ../views/customer_registration.php");
} else {
    $_SESSION['error_message'] = "There was an error during registration. Please try again.";
    header("Location: ../views/customer_registration.php.php");
}

exit();
