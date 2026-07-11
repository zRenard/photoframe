#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment to Apache..."

# Default values
DEST_DIR="/var/www/html"
PHOTOS_DIR="$DEST_DIR/photos"

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy files to destination
echo "📂 Copying files to $DEST_DIR..."
cp -r dist/* "$DEST_DIR/"

# Copy .htaccess file
cp .htaccess "$DEST_DIR/"

# Create photos directory if it doesn't exist
if [ ! -d "$PHOTOS_DIR" ]; then
    echo "📷 Creating photos directory at $PHOTOS_DIR..."
    mkdir -p "$PHOTOS_DIR"
    chmod 755 "$PHOTOS_DIR"
    echo "   ℹ️  Add your photos to $PHOTOS_DIR"
else
    echo "📷 Using existing photos directory at $PHOTOS_DIR"
fi

# Set permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data "$DEST_DIR"
chmod -R 755 "$DEST_DIR"

# Enable required Apache modules
echo "⚙️  Configuring Apache..."
a2enmod rewrite headers expires deflate

# Restart Apache
if systemctl is-active --quiet apache2; then
    echo "🔄 Restarting Apache..."
    systemctl restart apache2
else
    echo "⚠️  Apache is not running. Please start Apache to apply changes."
fi

echo "✅ Deployment complete!"
echo "🌐 Your photo frame is now available at http://$(hostname -I | awk '{print $1}')/"
