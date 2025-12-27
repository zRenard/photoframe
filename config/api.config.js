/**
 * PhotoFrame API Configuration
 * 
 * This file contains all API-related configuration settings.
 * For production deployments, ensure you set custom values for security settings.
 */

import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default configuration
const defaultConfig = {
  // API Authentication
  apiKey: 'default-api-key-change-me',
  
  // Rate Limiting
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes in milliseconds
  rateLimitMaxRequests: 10, // Maximum uploads per window
  
  // File Upload Settings
  maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Server Settings
  port: 3001,
  uploadDirectory: 'public/photos',
  
  // Security Settings
  enableCors: true,
  logUploads: true,
  enforceHttps: false, // Set to true in production
  
  // Development Settings
  isDevelopment: process.env.NODE_ENV !== 'production'
};

/**
 * Load configuration from environment variables and config files
 * Priority: Environment Variables > Local Config File > Default Config
 */
async function loadConfig() {
  let config = { ...defaultConfig };
  
  // Try to load local config file (gitignored for security)
  const localConfigPath = join(__dirname, 'api.local.js');
  if (fs.existsSync(localConfigPath)) {
    try {
      // Convert Windows path to file:// URL for ES modules
      const fileUrl = `file://${localConfigPath.replace(/\\/g, '/')}`;
      const localConfig = await import(fileUrl);
      config = { ...config, ...localConfig.default };
      console.log('📋 Loaded local API configuration');
    } catch (error) {
      console.warn('⚠️  Failed to load local config:', error.message);
    }
  }
  
  // Override with environment variables
  if (process.env.PHOTOFRAME_API_KEY) {
    config.apiKey = process.env.PHOTOFRAME_API_KEY;
  }
  
  if (process.env.PHOTOFRAME_PORT) {
    config.port = parseInt(process.env.PHOTOFRAME_PORT, 10);
  }
  
  if (process.env.PHOTOFRAME_MAX_FILE_SIZE) {
    config.maxFileSize = parseInt(process.env.PHOTOFRAME_MAX_FILE_SIZE, 10);
  }
  
  if (process.env.PHOTOFRAME_RATE_LIMIT) {
    config.rateLimitMaxRequests = parseInt(process.env.PHOTOFRAME_RATE_LIMIT, 10);
  }
  
  if (process.env.NODE_ENV === 'production') {
    config.isDevelopment = false;
    config.enforceHttps = true;
  }
  
  // Validate critical settings
  if (config.apiKey === defaultConfig.apiKey && !config.isDevelopment) {
    console.error('🚨 SECURITY WARNING: Using default API key in production!');
  }
  
  return config;
}

// Export the configuration
export default await loadConfig();

// Export individual settings for convenience
export const {
  apiKey,
  rateLimitWindow,
  rateLimitMaxRequests,
  maxFileSize,
  allowedMimeTypes,
  port,
  uploadDirectory,
  enableCors,
  logUploads,
  enforceHttps,
  isDevelopment
} = await loadConfig();
