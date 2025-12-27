export default {
  apiKey: 'test-api-key-from-local-config',
  port: 3002,
  rateLimitWindow: 15 * 60 * 1000,
  rateLimitMaxRequests: 10,
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  uploadDirectory: 'public/photos',
  enableCors: true,
  logUploads: true,
  enforceHttps: true,
  isDevelopment: true
};
