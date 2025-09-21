<?php
// Include the UserController
require_once '../controllers/UserController.php';

// Create an instance of UserController
$userController = new UserController();

// Call the logout method
$userController->logout();
?>
