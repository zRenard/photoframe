// Utility functions for handling images without Express server

/**
 * Fetch images directly from the public/photos directory
 * This works with Vite's static file serving
 */
export const fetchImagesFromDirectory = async () => {
  try {
    // In development, we'll use a hardcoded list or try to fetch from a manifest
    // In production, you'd typically have a manifest file or server endpoint
    
    // For now, let's try to load images by checking common filenames
    // or use the image list from localStorage if available
    const storedImages = localStorage.getItem('availableImages');
    if (storedImages) {
      return JSON.parse(storedImages);
    }

    // Fallback: return sample images that we know exist
    const knownImages = [
      '94189da0d4317c5ef546855f78bc616e_XL.jpg',
      'fire camp on the beach.jpg',
      'fire camp on the beach2.jpg',
      'iceage.jpg',
      'matrix-background.jpg',
      'sample1.jpg',
      'sample2.jpg',
      'thor.jpg'
    ];

    // Test which images actually exist
    const existingImages = [];
    for (const imageName of knownImages) {
      try {
        const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
        if (response.ok) {
          existingImages.push(imageName);
        }
      } catch {
        // Image doesn't exist, skip it
      }
    }

    // Store the found images for future use
    localStorage.setItem('availableImages', JSON.stringify(existingImages));
    
    return existingImages;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

/**
 * Comprehensive scan for images by trying many possible patterns
 * This method attempts to find images without relying on hardcoded lists
 */
export const comprehensiveScanForImages = async () => {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'];
  const foundImages = [];
  
  // Strategy 1: Try numeric patterns (1.jpg, 2.jpg, etc.)
  for (let i = 1; i <= 50; i++) {
    for (const ext of extensions) {
      const imageName = `${i}.${ext}`;
      try {
        const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
        if (response.ok) {
          foundImages.push(imageName);
        }
      } catch {
        // Continue
      }
    }
  }
  
  // Strategy 2: Try common name patterns
  const commonPatterns = [
    'image', 'photo', 'pic', 'img', 'picture',
    'sample', 'test', 'demo', 'example',
    'DSC', 'IMG', 'DSCN', 'P', // Camera naming patterns
    'photo', 'image', 'pic', 'shot',
    // Add patterns from known existing images
    '94189da0d4317c5ef546855f78bc616e_XL',
    'fire camp on the beach', 'fire camp on the beach2',
    'iceage', 'matrix-background', 'thor'
  ];
  
  for (const pattern of commonPatterns) {
    for (const ext of extensions) {
      const imageName = `${pattern}.${ext}`;
      try {
        const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
        if (response.ok && !foundImages.includes(imageName)) {
          foundImages.push(imageName);
        }
      } catch {
        // Continue
      }
    }
    
    // Try numbered variants (photo1.jpg, photo2.jpg, etc.)
    for (let i = 1; i <= 20; i++) {
      for (const ext of extensions) {
        const imageName = `${pattern}${i}.${ext}`;
        try {
          const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
          if (response.ok && !foundImages.includes(imageName)) {
            foundImages.push(imageName);
          }
        } catch {
          // Continue
        }
      }
    }
  }
  
  // Strategy 3: Try alphabet patterns (a.jpg, b.jpg, etc.)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  for (const letter of alphabet) {
    for (const ext of extensions) {
      const imageName = `${letter}.${ext}`;
      try {
        const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
        if (response.ok && !foundImages.includes(imageName)) {
          foundImages.push(imageName);
        }
      } catch {
        // Continue
      }
    }
  }
  
  return foundImages;
};

/**
 * Scan for images by trying common extensions
 * This is a more dynamic approach
 */
export const scanForImages = async (baseNames = []) => {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const foundImages = [];

  // If no base names provided, use some common patterns
  if (baseNames.length === 0) {
    baseNames = [
      'image', 'photo', 'pic', 'img',
      'sample', 'test', 'demo',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
    ];
  }

  for (const baseName of baseNames) {
    for (const ext of extensions) {
      const imageName = `${baseName}.${ext}`;
      try {
        const response = await fetch(`/photos/${imageName}`, { method: 'HEAD' });
        if (response.ok) {
          foundImages.push(imageName);
        }
      } catch {
        // Image doesn't exist, continue
      }
    }
  }

  return foundImages;
};

/**
 * Get all available images using multiple strategies
 */
export const getAllAvailableImages = async () => {
  // Strategy 1: Check if we have a recent cached scan (within last 30 seconds)
  const cacheKey = 'availableImages';
  const cacheTimeKey = 'availableImagesTime';
  const cachedTime = localStorage.getItem(cacheTimeKey);
  const now = Date.now();
  
  // If cache is recent (less than 30 seconds old), use it
  if (cachedTime && (now - parseInt(cachedTime)) < 30000) {
    const cachedImages = localStorage.getItem(cacheKey);
    if (cachedImages) {
      try {
        return JSON.parse(cachedImages);
      } catch {
        // Invalid cache, continue to scan
      }
    }
  }
  
  // Strategy 2: Try Express API first (if available)
  try {
    const response = await fetch('/api/images');
    if (response.ok) {
      const apiImages = await response.json();
      const imageList = apiImages.map(img => img.name || img);
      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(imageList));
      localStorage.setItem(cacheTimeKey, now.toString());
      return imageList;
    }
  } catch {
    // Express API not available, continue with client-side detection
  }
  
  // Strategy 3: Comprehensive client-side scan
  const images = await comprehensiveScanForImages();
  
  if (images.length > 0) {
    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify(images));
    localStorage.setItem(cacheTimeKey, now.toString());
    return images;
  }
  
  // Strategy 4: Fallback to old method
  const fallbackImages = await fetchImagesFromDirectory();
  
  // Cache even fallback results
  localStorage.setItem(cacheKey, JSON.stringify(fallbackImages));
  localStorage.setItem(cacheTimeKey, now.toString());
  
  return fallbackImages;
};

/**
 * Clear the stored image cache and force a fresh scan
 */
export const clearImageCache = () => {
  localStorage.removeItem('availableImages');
  localStorage.removeItem('availableImagesTime');
};

/**
 * Manually set the available images list
 * Useful for when you know the exact images in your directory
 */
export const setAvailableImages = (imageList) => {
  localStorage.setItem('availableImages', JSON.stringify(imageList));
};

/**
 * Add a new image to the available images list
 */
export const addImageToList = (imageName) => {
  const storedImages = localStorage.getItem('availableImages');
  const currentImages = storedImages ? JSON.parse(storedImages) : [];
  
  if (!currentImages.includes(imageName)) {
    currentImages.push(imageName);
    localStorage.setItem('availableImages', JSON.stringify(currentImages));
  }
  
  return currentImages;
};

/**
 * Remove an image from the available images list
 */
export const removeImageFromList = (imageName) => {
  const storedImages = localStorage.getItem('availableImages');
  const currentImages = storedImages ? JSON.parse(storedImages) : [];
  
  const updatedImages = currentImages.filter(img => img !== imageName);
  localStorage.setItem('availableImages', JSON.stringify(updatedImages));
  
  return updatedImages;
};

/**
 * Upload an image file to the photos directory
 * Note: This requires a server endpoint to handle file uploads
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Try to upload to a server endpoint if available
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      return { success: true, filename: result.filename };
    } else {
      throw new Error('Upload failed');
    }
  } catch {
    // If server upload fails, we'll handle it client-side
    console.warn('Server upload not available, handling client-side');
    return { success: false, error: 'Server upload not available. Please manually add images to public/photos directory.' };
  }
};

/**
 * Delete an image file from the photos directory
 * Note: This requires a server endpoint to handle file deletion
 */
export const deleteImage = async (imageName) => {
  try {
    const response = await fetch(`/api/images/${encodeURIComponent(imageName)}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      throw new Error('Delete failed');
    }
  } catch {
    console.warn('Server delete not available');
    return { success: false, error: 'Server delete not available. Please manually remove images from public/photos directory.' };
  }
};
