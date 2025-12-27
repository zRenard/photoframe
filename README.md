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

- 🚀 **Deployment Options**
  - Development server with hot-reload
  - Production-ready builds
  - Support for Node.js and Apache

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm (v7 or later) or yarn
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/photoframe.git
   cd photoframe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🖥️ Development

1. **Start the development environment**
   ```bash
   npm run dev:full
   ```
   This will start:
   - Vite dev server: http://localhost:5173
   - Express API server: http://localhost:3001

2. **Add your images**
   - Create a `public/photos` directory in the project root
   - Add your images to this directory
   - Supported formats: JPG, JPEG, PNG, GIF, WebP
   - The application will automatically detect and display all images

## 🚀 Production Deployment

### Option 1: Container with Podman (Recommended)

1. **Build the container image**
   ```bash
   # Build the image
   podman build -t photoframe .
   
   # Create a volume for persistent photo storage
   podman volume create photoframe-photos
   
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
   ```

2. **Start the production server**
   ```bash
   NODE_ENV=production node server.js
   ```
   The application will be available at `http://localhost:3001`

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

### Environment Variables

Create a `.env` file in the project root with the following variables:

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

3. **Apache deployment issues**
   - Ensure `mod_rewrite` is enabled
   - Verify `.htaccess` file is present in the web root
   - Check Apache error logs for specific issues

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), and [Express](https://expressjs.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)

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
