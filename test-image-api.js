#!/usr/bin/env node

/**
 * Test script for image upload/delete API endpoints
 * Run with: node test-image-api.js
 */

import fs from 'fs';
import fetch from 'node-fetch'; // You may need to install: npm install node-fetch
import FormData from 'form-data';

const API_BASE = 'http://localhost:3001';

async function testImageAPI() {
  console.log('🧪 Testing Image Upload/Delete API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const testResponse = await fetch(`${API_BASE}/api/test`);
    if (!testResponse.ok) {
      throw new Error('Server not running. Please start with: npm run dev:full');
    }
    console.log('✅ Server is running\n');

    // Test 2: Get initial image list
    console.log('2. Getting initial image list...');
    const imagesResponse = await fetch(`${API_BASE}/api/images`);
    const initialImages = await imagesResponse.json();
    console.log(`✅ Found ${initialImages.length} initial images\n`);

    // Test 3: Create a test image file
    console.log('3. Creating test image file...');
    const testImagePath = 'test-upload.jpg';
    
    // Create a minimal JPEG file (1x1 pixel)
    const jpegHeader = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 
      0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
      0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
      0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
      0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11,
      0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02,
      0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
      0xFF, 0xD9
    ]);
    
    fs.writeFileSync(testImagePath, jpegHeader);
    console.log('✅ Test image created\n');

    // Test 4: Upload the test image
    console.log('4. Testing image upload...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    const uploadResponse = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }
    
    const uploadResult = await uploadResponse.json();
    console.log(`✅ Image uploaded: ${uploadResult.filename}\n`);

    // Test 5: Verify image appears in list
    console.log('5. Verifying image appears in list...');
    const updatedImagesResponse = await fetch(`${API_BASE}/api/images`);
    const updatedImages = await updatedImagesResponse.json();
    console.log(`✅ Now found ${updatedImages.length} images\n`);

    // Test 6: Delete the uploaded image
    console.log('6. Testing image deletion...');
    const deleteResponse = await fetch(`${API_BASE}/api/delete-image?name=${uploadResult.filename}`, {
      method: 'DELETE'
    });
    
    if (!deleteResponse.ok) {
      throw new Error('Delete failed');
    }
    
    const deleteResult = await deleteResponse.json();
    console.log(`✅ Image deleted: ${deleteResult.message}\n`);

    // Test 7: Verify image is removed from list
    console.log('7. Verifying image is removed...');
    const finalImagesResponse = await fetch(`${API_BASE}/api/images`);
    const finalImages = await finalImagesResponse.json();
    console.log(`✅ Back to ${finalImages.length} images\n`);

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    console.log('🎉 All tests passed! Image upload/delete API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure to run: npm run dev:full');
    process.exit(1);
  }
}

// Run the test
testImageAPI();
