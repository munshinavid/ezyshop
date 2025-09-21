# Use PHP with Apache
FROM php:8.2-apache

# Install MySQLi extension for your DB class
RUN docker-php-ext-install mysqli

# Copy project files into Apache root
COPY . /var/www/html/

# Enable Apache rewrite module (optional for API routing)
RUN a2enmod rewrite
