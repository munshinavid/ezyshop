<?php
echo "<!-- this is the wishlist.php -->";
// wishlist.php
//session_start();

// Include header or common files if needed
// Example: include '../header.php';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopEasy - Your Wishlist</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../css/index.css">
</head>
<body>
    <header>
        <!-- You can include your existing header -->
        <div class="header-content">
            <a href="index.php" class="logo"><i class="fas fa-shopping-bag"></i> ShopEasy</a>
            <!-- Wishlist and Cart counts are already handled by main.js -->
        </div>
    </header>

    <main>
        <section class="wishlist-section">
            <h2>Your Wishlist</h2>
            <div id="wishlist-container" class="products-container">
                <!-- Products will be dynamically loaded here using JS -->
            </div>

            <!-- Optional: Empty state -->
            <div id="wishlist-empty" class="empty-state" style="display:none;">
                Your wishlist is empty. <a href="index.php">Start shopping!</a>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer>
        <!-- Your existing footer HTML -->
    </footer>

    <!-- Toast notifications -->
    <div id="toast-container"></div>

    <!-- Include main.js -->
    <script src="../scripts/main.js"></script>
    <script>
        // On page load, fetch wishlist items
        document.addEventListener('DOMContentLoaded', async function() {
            try {
                const wishlistItems = await window.ecommerceAPI.getWishlistItems();
                const container = document.getElementById('wishlist-container');
                const empty = document.getElementById('wishlist-empty');

                if (!wishlistItems || wishlistItems.length === 0) {
                    container.style.display = 'none';
                    empty.style.display = 'block';
                    return;
                }

                empty.style.display = 'none';
                container.style.display = 'grid'; // same as home products grid

                // Use existing renderProducts function
                window.renderProducts(wishlistItems);

            } catch (error) {
                console.error('Failed to load wishlist items:', error);
                showToast('Failed to load wishlist. Please refresh.', 'error');
            }
        });
    </script>
</body>
</html>
