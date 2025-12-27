#!/usr/bin/env node

/**
 * Image Setup Script
 * 
 * This script helps you set up your image list for the photoframe application
 * when running without an Express server.
 */

const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'public', 'photos');

try {
  // Check if photos directory exists
  if (!fs.existsSync(photosDir)) {
    console.log('❌ Photos directory not found. Creating it...');
    fs.mkdirSync(photosDir, { recursive: true });
    console.log('✅ Created public/photos directory');
    console.log('📝 Add your images to public/photos and run this script again');
    process.exit(0);
  }

  // Read the directory
  const files = fs.readdirSync(photosDir);
  
  // Filter for image files
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log('❌ No image files found in public/photos');
    console.log('📝 Add some images (JPG, PNG, GIF, WebP) to the public/photos directory');
    process.exit(0);
  }

  console.log(`✅ Found ${imageFiles.length} image(s):`);
  imageFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  // Generate JavaScript code to set the images
  const jsCode = `
// Auto-generated image list - paste this in your browser console
// or add it to your application initialization

import { setAvailableImages } from './src/utils/imageUtils.js';

const imageList = ${JSON.stringify(imageFiles, null, 2)};

// Set the available images
setAvailableImages(imageList);

console.log('✅ Image list updated:', imageList);
`;

  // Write to a file
  fs.writeFileSync('image-setup.js', jsCode);
  
  console.log('\n📄 Generated image-setup.js file');
  console.log('💡 You can also manually set images in your browser console:');
  console.log(`   localStorage.setItem('availableImages', '${JSON.stringify(imageFiles)}');`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
