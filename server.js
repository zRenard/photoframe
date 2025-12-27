import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Enable JSON parsing for uploads
app.use(express.json());

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const photosDir = join(__dirname, 'public', 'photos');
    // Ensure the photos directory exists
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    // Use original filename or generate a unique one
    const originalName = file.originalname;
    const filePath = join(__dirname, 'public', 'photos', originalName);
    
    // If file already exists, add a number suffix
    if (fs.existsSync(filePath)) {
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const ext = originalName.match(/\.[^/.]+$/)?.[0] || '';
      let counter = 1;
      let newName;
      
      do {
        newName = `${nameWithoutExt}_${counter}${ext}`;
        counter++;
      } while (fs.existsSync(join(__dirname, 'public', 'photos', newName)));
      
      cb(null, newName);
    } else {
      cb(null, originalName);
    }
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Request logging middleware (disabled)
app.use((req, res, next) => {
  next();
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working' });
});

// API endpoint to get list of images
app.get('/api/images', async (req, res) => {
  try {
    const photosDir = join(__dirname, 'public', 'photos');

    // Ensure the photos directory exists
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    // Read the directory
    const files = fs.readdirSync(photosDir);

    // Filter for image files and create full URLs
    const imageFiles = files
      .filter(file => /.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => ({
        url: `/photos/${encodeURIComponent(file)}`,
        name: file,
        lastModified: fs.statSync(join(__dirname, 'public', 'photos', file)).mtime.getTime()
      }));

    // If no images found, return sample images
    if (imageFiles.length === 0) {
      return res.json([
        { url: '/photos/photo1.jpg', name: 'Sample 1', lastModified: Date.now() },
        { url: '/photos/photo2.jpg', name: 'Sample 2', lastModified: Date.now() },
        { url: '/photos/photo3.jpg', name: 'Sample 3', lastModified: Date.now() },
        { url: '/photos/photo4.jpg', name: 'Sample 4', lastModified: Date.now() },
        { url: '/photos/photo5.jpg', name: 'Sample 5', lastModified: Date.now() },
      ]);
    }

    res.json(imageFiles);
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Upload image endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    res.json({ 
      success: true, 
      filename: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image endpoint
app.delete('/api/delete-image', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Image name is required' });
    }
    
    const imagePath = join(__dirname, 'public', 'photos', name);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete the file
    fs.unlinkSync(imagePath);
    
    res.json({ 
      success: true, 
      message: 'Image deleted successfully'
    });
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Serve photos from the public/photos directory
app.use('/photos', express.static(join(__dirname, 'public', 'photos')));

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  
  // Handle SPA - serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`📸 PhotoFrame Express server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', () => {
  // Handle unhandled rejections silently
});
