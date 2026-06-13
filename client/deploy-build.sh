#!/bin/bash

# NonsaTravels - Frontend Build Script
# This script prepares your frontend for production deployment

echo "🚀 Building NonsaTravels Frontend for Production..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the client directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found!"
    echo "Creating template..."
    
    cat > .env.production << 'EOF'
# Production Environment Variables
VITE_API_URL=https://api.yourdomain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
EOF
    
    echo "✅ Created .env.production template"
    echo "⚠️  IMPORTANT: Update .env.production with your production values!"
    echo ""
    read -p "Press Enter to continue after updating .env.production..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run build
echo ""
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist folder was created
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not created!"
    exit 1
fi

# Create deployment package
echo ""
echo "📦 Creating deployment package..."
cd dist

# Create a zip file for easy upload
zip -r ../nonsatravels-frontend.zip .

cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📁 Files ready for deployment:"
echo "   - dist/ folder contains all frontend files"
echo "   - nonsatravels-frontend.zip ready for upload"
echo ""
echo "📤 Next Steps:"
echo "   1. Upload contents of 'dist/' folder to Hostinger /public_html/"
echo "   2. Create .htaccess file (see deployment guide)"
echo "   3. Enable SSL certificate"
echo ""
echo "🎉 Happy deploying!"
