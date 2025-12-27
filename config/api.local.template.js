/**
 * Local API Configuration Template
 * 
 * Copy this file to 'api.local.js' and customize the values for your environment.
 * The api.local.js file is gitignored for security and will override default settings.
 * 
 * Priority: Environment Variables > api.local.js > Default Config
 */

export default {
  // 🔐 SECURITY: Change this API key for production!
  // You can also set PHOTOFRAME_API_KEY environment variable
  apiKey: 'your-secure-api-key-here',
  
  // Rate limiting settings
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 10, // Max uploads per window
  
  // File upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Server settings
  port: 3001,
  uploadDirectory: 'public/photos',
  
  // Security settings
  enableCors: true,
  logUploads: true,
  enforceHttps: false, // Set to true in production
  
  // Development mode override
  isDevelopment: false // Set to true for development mode
};
