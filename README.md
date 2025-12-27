# 📷 Photo Frame Slideshow

A modern, responsive photo frame application built with React, Vite, and Express. This application displays a beautiful slideshow of your images with fully configurable display options for date and time.

## ✨ Features

- 🖼️ **Image Slideshow**
  - Smooth transitions between images
  - Random or sequential display options
  - Adjustable rotation time (1-60 seconds)
  - Image counter display
  - Fallback to sample images if none found

- 📅 **Date & Time Display**
  - Toggle date/time display on/off
  - Multiple date format options
  - 12/24 hour time format
  - Customizable positions (7 positions)
  - Adjustable text sizes

- ⚙️ **Configuration**
  - Intuitive settings panel
  - Real-time preview of changes
  - Responsive design for all screen sizes
  - Dark mode optimized UI
  - Professional configuration system with multiple sources

- 🖼️ **Image Management**
  - Built-in image browser with thumbnails
  - Upload images directly from browser (dev mode)
  - Delete images with confirmation (dev mode)
  - **Remote API uploads** with authentication and rate limiting
  - Automatic image detection and caching
  - Support for JPG, JPEG, PNG, GIF, WebP formats

- � **Remote API (NEW)**
  - Secured API endpoints with API key authentication
  - Rate limiting (10 uploads per 15 minutes)
  - File validation and security features
  - Interactive validation page for testing
  - Multiple configuration sources (env vars, local config, defaults)

- �🚀 **Deployment Options**
  - Development server with hot-reload
  - Production-ready builds
  - Support for Node.js and Apache
  - Professional configuration management

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm (v7 or later) or yarn
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zrenard/photoframe.git
   cd photoframe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🖥️ Development

### 🎯 Quick Start Modes

#### Mode 1: Simple Static Mode (Default)
```bash
npm run dev
```
- **Port**: http://localhost:5173
- **Image Management**: Manual file system only
- **Features**: View images, automatic detection
- **Best for**: Quick setup, basic usage

#### Mode 2: Full Development Mode  
```bash
npm run dev:full
```
- **Ports**: http://localhost:5173 (Vite) + http://localhost:3001 (Express)
- **Image Management**: Upload/delete from browser + file system
- **Features**: All features including browser-based image management
- **Best for**: Development, content management

#### Mode 3: Remote API Mode (NEW)
```bash
# Configure your API key first
cp config/api.local.template.js config/api.local.js
# Edit the file with your settings

# Start the server
node server.js
```
- **Port**: http://localhost:3001 (or your configured port)
- **Image Management**: Secured remote uploads + all local features
- **Features**: Enterprise-grade API with authentication and rate limiting
- **Validation Page**: http://localhost:3001/validate
- **Best for**: Production deployment, remote integrations
- **Best for**: Quick setup, basic usage

#### Mode 2: Full Development Mode  
```bash
npm run dev:full
```
- **Ports**: http://localhost:5173 (Vite) + http://localhost:3001 (Express)
- **Image Management**: Upload/delete from browser + file system
- **Features**: All features including browser-based image management
- **Best for**: Development, content management

### 🖼️ Managing Images

#### Static Mode (Simple)
1. Add images to `public/photos/` directory
2. Open Settings → General → Images tab
3. Click "Scan for Images" to refresh
4. Delete files manually from `public/photos/`

#### Full Mode (Express API)
1. Open Settings → General → Images tab  
2. Use "Upload Image" button to add files
3. Click red ❌ button on thumbnails to delete
4. Files are automatically synced

#### Remote API Mode (NEW)
1. **Configure Authentication**: Set API key in config or environment
2. **Use Validation Page**: Visit `/validate` for interactive testing
3. **Remote Uploads**: POST to `/api/remote-upload` with API key
4. **Monitor Activity**: Check server logs for upload tracking
5. **Rate Limits**: Automatic protection (10 uploads per 15 minutes)

### 📋 Feature Comparison

| Feature | Static Mode | Full Mode | Remote API |
|---------|-------------|-----------|------------|
| View thumbnails | ✅ | ✅ | ✅ |
| Auto-detect images | ✅ | ✅ | ✅ |
| Browser upload | ❌ | ✅ | ✅ |
| Browser delete | ❌ | ✅ | ✅ |
| File validation | ❌ | ✅ | ✅ |
| Duplicate handling | ❌ | ✅ | ✅ |
| Real-time sync | ❌ | ✅ | ✅ |
| **API Authentication** | ❌ | ❌ | ✅ |
| **Rate Limiting** | ❌ | ❌ | ✅ |
| **Remote Uploads** | ❌ | ❌ | ✅ |
| **Production Security** | ❌ | ❌ | ✅ |
| Memory usage | Low | Medium | Medium |
| Setup complexity | Simple | Medium | Advanced |
| Production ready | ✅ | ❌ (dev only) | ✅ |

## 🔐 Remote API Configuration (NEW)

The PhotoFrame API now includes a professional configuration system with secured remote upload capabilities.

### Quick Setup

#### Option 1: Environment Variables (Production)
```bash
# Set your API key
export PHOTOFRAME_API_KEY="your-secure-api-key-here"
export NODE_ENV=production

# Start the server
node server.js
```

#### Option 2: Local Configuration File (Development)
```bash
# Copy the template
cp config/api.local.template.js config/api.local.js

# Edit config/api.local.js with your settings
node server.js
```

### Configuration Sources (Priority Order)
1. **Environment Variables** (highest priority)
2. **Local Config File** (`config/api.local.js`)
3. **Default Configuration** (fallback)

### Available Settings

| Setting | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| `apiKey` | `PHOTOFRAME_API_KEY` | `'default-api-key-change-me'` | API authentication key |
| `port` | `PHOTOFRAME_PORT` | `3001` | Server port number |
| `rateLimitMaxRequests` | `PHOTOFRAME_RATE_LIMIT` | `10` | Max uploads per 15min window |
| `maxFileSize` | `PHOTOFRAME_MAX_FILE_SIZE` | `10485760` | Max file size (10MB) |
| `isDevelopment` | `NODE_ENV` | `true` | Development/Production mode |

### Remote API Endpoints

- `GET /api/info` - API documentation and status
- `GET /api/test-secure` - Test authentication
- `POST /api/remote-upload` - Upload images (requires API key)
- `GET /validate` - Interactive testing interface

### Testing the Remote API

1. **Start the server**: `node server.js`
2. **Visit validation page**: http://localhost:3001/validate (or your configured port)
3. **Use your API key** to test uploads and authentication
4. **Upload images** via the beautiful web interface

### Example: Remote Upload with curl
```bash
curl -X POST http://localhost:3001/api/remote-upload \
  -H "X-API-Key: your-api-key" \
  -F "image=@/path/to/your/image.jpg"
```

### Security Features
- 🔐 **API Key Authentication** - Required for all remote operations  
- ⏱️ **Rate Limiting** - 10 uploads per 15 minutes per client
- 🛡️ **File Validation** - Only allowed image types and sizes
- 🔒 **Production Warnings** - Alerts for insecure configurations
- 📝 **Comprehensive Logging** - Track all upload activity

For complete configuration documentation, see [`docs/config/README.md`](docs/config/README.md).


### 🚀 Testings

- **Test**
   ```npm test```
- **Run tests with coverage**
   ```npm test -- --coverage```

### 🚀 Performance Optimizations

This application has been optimized for better performance with:

- **Modular Architecture**: Custom hooks separate business logic from UI components
- **Memoized Components**: Strategic use of React.memo to prevent unnecessary re-renders
- **Optimized Event Handlers**: useCallback for stable function references
- **Efficient State Management**: Grouped related state and optimized updates
- **Lazy Loading**: Components load only when needed


## 🚀 Production Deployment

### Option 1: Container with Podman (Recommended)

1. **Build the container image**
   ```bash
   # Build the image
   podman build -t photoframe .
      
   # Alternative builds with different options:
   # Skip npm update to avoid compatibility issues
   # podman build -t photoframe --build-arg SKIP_NPM_UPDATE=true .
   #  
   # Use a specific Node.js version
   # podman build -t photoframe --build-arg NODE_VERSION=20.15.0 .
   #
   # Use both options together
   # podman build -t photoframe --build-arg NODE_VERSION=20.15.0 --build-arg SKIP_NPM_UPDATE=true .
   ```

2. **Run the container**
   ```bash
   # Basic deployment
   podman run -d \
     --name photoframe \
     -p 3001:3001 \
     -v C:\\git_clones\\photoframe\\public\\photos:/app/public/photos:Z \
     --restart unless-stopped \
     --health-cmd "curl -f http://localhost:3001/api/test || exit 1" \
     --health-interval=30s \
     --health-timeout=3s \
     --health-retries=3 \
     photoframe
   
   # Production deployment with API security
   podman run -d \
     --name photoframe \
     -p 3001:3001 \
     -e PHOTOFRAME_API_KEY="your-secure-api-key-here" \
     -e NODE_ENV=production \
     -e PHOTOFRAME_RATE_LIMIT=20 \
     -v C:\\git_clones\\photoframe\\public\\photos:/app/public/photos:Z \
     --restart unless-stopped \
     --health-cmd "curl -f http://localhost:3001/api/test || exit 1" \
     --health-interval=30s \
     --health-timeout=3s \
     --health-retries=3 \
     photoframe
   ```
   The application will be available at `http://localhost:3001`

3. **Adding photos**
   ```bash
   # Copy photos to the volume
   podman volume inspect photoframe-photos --format '{{.Mountpoint}}/.'
   # Then copy your photos to the directory shown above
   
   # Or use a bind mount instead of a volume
   # podman run -v /path/to/your/photos:/app/public/photos:Z ...
   ```

4. **View logs**
   ```bash
   podman logs -f photoframe
   ```

### Option 2: Node.js Server

1. **Build the application**
   ```bash
   npm run build
   # Deploy 'dist' folder to any static host
   # Add images manually to photos directory
   ```

2. **Configure for production**
   ```bash
   # Option A: Environment variables
   export PHOTOFRAME_API_KEY="your-secure-api-key-here"
   export NODE_ENV=production
   export PHOTOFRAME_PORT=3001
   
   # Option B: Local configuration file
   cp config/api.local.template.js config/api.local.js
   # Edit the file with your production settings
   ```

3. **Start the production server**
   ```bash
   # Basic server
   NODE_ENV=production node server.js
   
   # With custom API key
   PHOTOFRAME_API_KEY="your-key" NODE_ENV=production node server.js
   
   # With PM2 (recommended)
   pm2 start server.js --name photoframe --env production
   ```
   The application will be available at `http://localhost:3001` (or your configured port)

### Option 3: Apache Web Server

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Apache**
   - Copy the contents of the `dist` directory to your web root (e.g., `/var/www/html`)
   - Create a `photos` directory in your web root and add your images
   - Copy `api.php` to your web root
   - Ensure `mod_rewrite` is enabled in Apache
   - The application will be available at your Apache server's address

## 🔧 Configuration

### Configuration System (NEW)

PhotoFrame now uses a professional multi-source configuration system:

**Priority Order:**
1. Environment Variables (highest)
2. Local Config File (`config/api.local.js`) 
3. Default Values (fallback)

### Environment Variables

The following environment variables are supported:

```env
# API Configuration
PHOTOFRAME_API_KEY=your-secure-api-key-here
PHOTOFRAME_PORT=3001
PHOTOFRAME_RATE_LIMIT=10
PHOTOFRAME_MAX_FILE_SIZE=10485760

# Application Mode
NODE_ENV=production
```

### Local Configuration File

For development or when environment variables aren't suitable:

```bash
# Copy the template
cp config/api.local.template.js config/api.local.js

# Edit with your settings
export default {
  apiKey: 'your-secure-api-key-here',
  port: 3001,
  rateLimitMaxRequests: 10,
  maxFileSize: 10 * 1024 * 1024,
  isDevelopment: false
};
```

### Legacy Environment Variables (Still Supported)

For backwards compatibility:

```env
PORT=3001
NODE_ENV=development
```

### Image Directory

- Place your images in the `public/photos` directory
- Supported formats: JPG, JPEG, PNG, GIF, WebP
- For best results, use landscape-oriented images with a 16:9 aspect ratio

## 🛠️ Available Scripts

- `npm run dev` - Start Vite development server only
- `npm run dev:server` - Start only the Express API server with nodemon
- `npm run dev:full` - Start both Vite and API servers for development
- `npm run build` - Build the application for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm start` - Start the production server (after building)

## 🎛️ API Endpoints

- `GET /api/test` - Test endpoint to verify the API is running
- `GET /api/images` - Get list of available images
- `POST /api/upload-image` - Upload a new image (dev mode only)
- `DELETE /api/delete-image?name=filename` - Delete an image (dev mode only)
- `GET /photos/:filename` - Serve an image file

## 🛠️ Configuration Panel

Access the configuration panel by clicking the gear icon (⚙️) in the top-right corner.

### Display Options
- **Show Date**: Toggle date display
- **Show Time**: Toggle time display
- **Show Image Counter**: Display the current image number

### Date & Time Settings
- **Date Format**: Multiple format options
- **Time Format**: 12/24 hour format
- **Show Seconds**: Toggle seconds in time display
- **Text Size**: Adjust text size (small to xxlarge)
- **Position**: 7 different screen positions

## 🧪 Testing Remote API

### Interactive Validation Page

PhotoFrame includes a beautiful, interactive validation page for testing the remote API:

1. **Start the server**: `node server.js`
2. **Visit**: http://localhost:3001/validate (or your configured port)
3. **Features**:
   - Test API connectivity with your API key
   - Upload images through the web interface
   - Real-time error reporting and success feedback
   - File validation and progress indicators
   - Modern, responsive design

### API Testing with curl

```bash
# Test basic connectivity
curl http://localhost:3001/api/test

# Test secure endpoint
curl -H "X-API-Key: your-api-key" http://localhost:3001/api/test-secure

# Upload an image
curl -X POST http://localhost:3001/api/remote-upload \
  -H "X-API-Key: your-api-key" \
  -F "image=@/path/to/your/image.jpg"
```

### API Documentation

Visit `http://localhost:3001/api/info` for complete API documentation including:
- Available endpoints
- Authentication requirements  
- Rate limiting information
- File requirements and restrictions
- Configuration status

## 🔍 Troubleshooting

### Common Issues

1. **No images loading**
   - Ensure the `public/photos` directory exists and contains images
   - Check browser console for errors (F12 > Console)
   - Verify file permissions on the photos directory

2. **API connection errors**
   - Ensure the Express server is running (port 3001 by default)
   - Check for CORS errors in the browser console
   - Verify the API URL in the frontend code

3. **Remote API issues**
   - **401 Unauthorized**: Check your API key configuration
   - **403 Forbidden**: Verify the API key is correct
   - **429 Rate Limited**: Wait 15 minutes or adjust rate limits
   - **500 Server Error**: Check server logs and file permissions
   - **Configuration not loading**: Verify file paths and syntax in `config/api.local.js`

4. **Apache deployment issues**
   - Ensure `mod_rewrite` is enabled
   - Verify `.htaccess` file is present in the web root
   - Check Apache error logs for specific issues

### Server Startup Messages

Look for these messages when starting the server:
```
📋 Loaded local API configuration    # Config file found and loaded
🔐 API Key: ✅ Custom key configured  # Secure API key in use
⚠️  Using default key - CHANGE THIS!  # Security warning
📏 Upload limits: 10MB, 10 per 15min  # Current limits displayed
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and [Express](https://expressjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)
- Secure file uploads with [Multer](https://github.com/expressjs/multer)
- Professional configuration system with multi-source support

#
## 🎨 Customization

### Adding Custom Styles
You can customize the appearance by modifying the Tailwind configuration in `tailwind.config.js` or by adding custom CSS in `src/index.css`.

### Environment Variables
Create a `.env` file in the root directory to set environment variables:

```env
VITE_API_URL=http://localhost:3000  # Backend API URL
VITE_DEFAULT_ROTATION_TIME=10       # Default rotation time in seconds
```

## 📦 Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the production-ready files that you can deploy to any static hosting service.

## 🚀 Deployment

### Static Hosting
Deploy the contents of the `dist` directory to any static hosting service:
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

### Containerized Deployment
A `Containerfile` is included for containerized deployment:

```bash
# Build the Container image
podman build -t photoframe .

# Run the container
podman run -p 4173:80 photoframe
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)
- Inspired by digital photo frames and smart displays

## 📸 Adding Photos

1. Place your images in the `public/photos` directory
2. The application will automatically detect and include them in the slideshow
3. For best results, use landscape-oriented images with a 16:9 aspect ratio

## 📱 Mobile Support
The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablets and iPads
- Mobile devices (with touch controls)

## ⚠️ Troubleshooting

### Images not loading?
- Ensure images are in the `public/photos` directory
- Check file extensions (.jpg, .jpeg, .png, .gif, .webp)
- Verify file permissions

### Configuration not saving?
- The app uses browser's localStorage to save settings
- Clear your browser cache if you experience issues
- Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Container build issues?
- If you encounter npm version compatibility errors, use `--build-arg SKIP_NPM_UPDATE=true`
- For production environments, consider using a security-hardened base image
- You can specify a different Node.js version with `--build-arg NODE_VERSION=x.y.z`

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/)

## 🌟 Show Your Support

If you find this project useful, please consider giving it a ⭐️ on GitHub!
