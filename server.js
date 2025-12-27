import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import process from 'process';
import config from './config/api.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = config.port;

// Security configuration from config file
const API_KEY = config.apiKey;
const RATE_LIMIT_WINDOW = config.rateLimitWindow;
const RATE_LIMIT_MAX_REQUESTS = config.rateLimitMaxRequests;
const rateLimitStore = new Map();

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const clientId = req.ip + (req.headers['x-api-key'] || 'anonymous');
  const now = Date.now();
  
  // Clean old entries
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
  
  // Check current client
  const clientData = rateLimitStore.get(clientId);
  if (clientData) {
    if (now - clientData.firstRequest > RATE_LIMIT_WINDOW) {
      rateLimitStore.set(clientId, { count: 1, firstRequest: now });
    } else if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW / 60000} minutes`
      });
    } else {
      clientData.count++;
    }
  } else {
    rateLimitStore.set(clientId, { count: 1, firstRequest: now });
  }
  
  next();
};

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required', 
      message: 'Please provide an API key in the X-API-Key header or apiKey query parameter'
    });
  }
  
  if (apiKey !== API_KEY) {
    return res.status(403).json({ 
      error: 'Invalid API key', 
      message: 'The provided API key is not valid'
    });
  }
  
  next();
};

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
    // Generate a secure filename with timestamp
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(6).toString('hex');
    const originalName = file.originalname;
    const ext = originalName.match(/\.[^/.]+$/)?.[0] || '';
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
    
    const newFileName = `${safeName}_${timestamp}_${randomString}${ext}`;
    cb(null, newFileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (config.allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
    }
  }
});

// Request logging middleware (disabled)
app.use((req, res, next) => {
  next();
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working', timestamp: new Date().toISOString() });
});

// Secured test endpoint for API key validation
app.get('/api/test-secure', authenticateApiKey, (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Secure API is working', 
    authenticated: true,
    timestamp: new Date().toISOString()
  });
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
    console.error('Failed to fetch images:', error.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Original upload endpoint (for local development)
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
  } catch (error) {
    console.error('Failed to upload image:', error.message);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Secured remote upload endpoint
app.post('/api/remote-upload', rateLimit, authenticateApiKey, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please upload an image file in the "image" field'
      });
    }
    
    // Get file info
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      url: `/photos/${req.file.filename}`
    };
    
    // Log successful upload
    console.log(`📸 Remote upload successful: ${fileInfo.filename} (${Math.round(fileInfo.size / 1024)}KB)`);
    
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully via remote API',
      file: fileInfo
    });
  } catch (error) {
    console.error('Remote upload error:', error.message);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error.message 
    });
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
  } catch (error) {
    console.error('Failed to delete image:', error.message);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PhotoFrame Remote API',
    version: '1.0.0',
    endpoints: {
      'GET /api/test': 'Test basic API connectivity',
      'GET /api/test-secure': 'Test secure API with authentication (requires API key)',
      'GET /api/images': 'Get list of all images',
      'POST /api/upload-image': 'Upload image (local development)',
      'POST /api/remote-upload': 'Upload image via secured remote API (requires API key)',
      'DELETE /api/delete-image': 'Delete an image',
      'GET /api/info': 'This endpoint'
    },
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      alternativeQueryParam: 'apiKey'
    },
    rateLimits: {
      remoteUpload: `${RATE_LIMIT_MAX_REQUESTS} requests per ${RATE_LIMIT_WINDOW / 60000} minutes`
    },
    fileRequirements: {
      maxSize: `${Math.round(config.maxFileSize / 1024 / 1024)}MB`,
      allowedTypes: config.allowedMimeTypes,
      fieldName: 'image'
    },
    configuration: {
      isDevelopment: config.isDevelopment,
      corsEnabled: config.enableCors,
      httpsEnforced: config.enforceHttps,
      loggingEnabled: config.logUploads
    }
  });
});

// Serve photos from the public/photos directory
app.use('/photos', express.static(join(__dirname, 'public', 'photos')));

// Serve the validation page
app.get('/validate', (req, res) => {
  const validationPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhotoFrame Remote API Validation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #4c63d2 0%, #6b46c1 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .content {
            padding: 30px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }
        
        input[type="text"],
        input[type="file"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="file"]:focus {
            outline: none;
            border-color: #4c63d2;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            margin: 25px 0;
        }
        
        button {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #4c63d2 0%, #6b46c1 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(76, 99, 210, 0.3);
        }
        
        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
        }
        
        .btn-secondary:hover {
            background: #e5e7eb;
        }
        
        .result {
            margin-top: 25px;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .result.success {
            background: #ecfdf5;
            color: #065f46;
            border: 2px solid #10b981;
        }
        
        .result.error {
            background: #fef2f2;
            color: #991b1b;
            border: 2px solid #ef4444;
        }
        
        .result.info {
            background: #eff6ff;
            color: #1e40af;
            border: 2px solid #3b82f6;
        }
        
        .file-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 14px;
            color: #64748b;
        }
        
        .api-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4c63d2;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📸 PhotoFrame Remote API</h1>
            <p>Test and validate remote image uploads</p>
        </div>
        
        <div class="content">
            <div class="api-info">
                <strong>Server:</strong> <span id="server-url"></span><br>
                <strong>Endpoint:</strong> POST /api/remote-upload<br>
                <strong>Authentication:</strong> API Key required<br>
                <strong>Rate Limit:</strong> 10 uploads per 15 minutes
            </div>
            
            <form id="upload-form">
                <div class="form-group">
                    <label for="api-key">API Key</label>
                    <input type="text" id="api-key" placeholder="Enter your API key" required>
                </div>
                
                <div class="form-group">
                    <label for="image-file">Select Image</label>
                    <input type="file" id="image-file" accept="image/*" required>
                    <div class="file-info">
                        Supported formats: JPEG, PNG, GIF, WebP • Max size: 10MB
                    </div>
                </div>
                
                <div class="button-group">
                    <button type="button" class="btn-secondary" onclick="testConnection()">Test Connection</button>
                    <button type="submit" class="btn-primary">Upload Image</button>
                </div>
            </form>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <span>Processing...</span>
            </div>
            
            <div id="result"></div>
        </div>
    </div>

    <script>
        // Set server URL
        document.getElementById('server-url').textContent = window.location.origin;
        
        // Test connection function
        async function testConnection() {
            const apiKey = document.getElementById('api-key').value;
            const resultDiv = document.getElementById('result');
            
            if (!apiKey) {
                showResult('Please enter an API key first', 'error');
                return;
            }
            
            showLoading(true);
            
            try {
                const response = await fetch('/api/test-secure', {
                    headers: {
                        'X-API-Key': apiKey
                    }
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showResult('✅ Connection successful!\\n\\n' + JSON.stringify(result, null, 2), 'success');
                } else {
                    showResult('❌ Connection failed\\n\\n' + JSON.stringify(result, null, 2), 'error');
                }
            } catch (error) {
                showResult('❌ Network error: ' + error.message, 'error');
            }
            
            showLoading(false);
        }
        
        // Upload form handler
        document.getElementById('upload-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const apiKey = document.getElementById('api-key').value;
            const fileInput = document.getElementById('image-file');
            const file = fileInput.files[0];
            
            if (!apiKey) {
                showResult('Please enter an API key', 'error');
                return;
            }
            
            if (!file) {
                showResult('Please select an image file', 'error');
                return;
            }
            
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
                showResult('File too large. Maximum size is 10MB', 'error');
                return;
            }
            
            const formData = new FormData();
            formData.append('image', file);
            
            showLoading(true);
            
            try {
                const response = await fetch('/api/remote-upload', {
                    method: 'POST',
                    headers: {
                        'X-API-Key': apiKey
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showResult('✅ Upload successful!\\n\\n' + JSON.stringify(result, null, 2), 'success');
                } else {
                    showResult('❌ Upload failed\\n\\n' + JSON.stringify(result, null, 2), 'error');
                }
            } catch (error) {
                showResult('❌ Upload error: ' + error.message, 'error');
            }
            
            showLoading(false);
        });
        
        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = message;
            resultDiv.className = 'result ' + type;
            resultDiv.style.display = 'block';
        }
        
        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }
        
        // Load API info on page load
        window.addEventListener('load', async function() {
            try {
                const response = await fetch('/api/info');
                const info = await response.json();
                console.log('API Info:', info);
            } catch (error) {
                console.warn('Could not load API info:', error);
            }
        });
    </script>
</body>
</html>
  `;
  
  res.send(validationPage);
});

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
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`📸 PhotoFrame Express server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`🧪 Validation page at http://localhost:${PORT}/validate`);
  console.log(`� Configuration: ${config.isDevelopment ? 'Development' : 'Production'} mode`);
  console.log(`�🔐 API Key: ${API_KEY === 'default-api-key-change-me' ? '⚠️  Using default key - CHANGE THIS!' : '✅ Custom key configured'}`);
  console.log(`📏 Upload limits: ${Math.round(config.maxFileSize / 1024 / 1024)}MB, ${config.rateLimitMaxRequests} per ${config.rateLimitWindow / 60000}min`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', () => {
  // Handle unhandled rejections silently
});
