import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

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
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch images' });
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
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  // Server started successfully
});

// Handle unhandled promise rejections
process.on('unhandledRejection', () => {
  // Handle unhandled rejections silently
});
