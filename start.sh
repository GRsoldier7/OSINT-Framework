#!/bin/bash

# Ultimate OSINT Framework v2.0 Startup Script
# This script helps you start the OSINT Framework with proper configuration

echo "🚀 Ultimate OSINT Framework v2.0"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js to version 18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ Created .env file from template"
        echo "📝 Please edit .env file with your API keys and configuration"
    else
        echo "❌ env.example not found. Please create a .env file manually."
        exit 1
    fi
else
    echo "✅ .env file found"
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads public/images

# Check if logs directory exists and is writable
if [ ! -w logs ]; then
    echo "❌ Cannot write to logs directory. Please check permissions."
    exit 1
fi

echo "✅ Directories created"

# Check environment configuration
echo "🔧 Checking environment configuration..."

# Check if required environment variables are set
if [ -f .env ]; then
    source .env
    
    # Check for OpenAI API key
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
        echo "⚠️  OpenAI API key not configured. AI features will be limited."
        echo "   Get your API key from: https://platform.openai.com/api-keys"
    else
        echo "✅ OpenAI API key configured"
    fi
    
    # Check for other optional API keys
    if [ -z "$SHODAN_API_KEY" ] || [ "$SHODAN_API_KEY" = "your_shodan_api_key_here" ]; then
        echo "⚠️  Shodan API key not configured. Some features will be limited."
    else
        echo "✅ Shodan API key configured"
    fi
    
    if [ -z "$VIRUSTOTAL_API_KEY" ] || [ "$VIRUSTOTAL_API_KEY" = "your_virustotal_api_key_here" ]; then
        echo "⚠️  VirusTotal API key not configured. Some features will be limited."
    else
        echo "✅ VirusTotal API key configured"
    fi
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Database features will be limited."
        echo "   Start MongoDB with: sudo systemctl start mongod"
    fi
else
    echo "ℹ️  MongoDB not installed. Database features will be limited."
fi

# Check if Redis is running (optional)
if command -v redis-server &> /dev/null; then
    if pgrep -x "redis-server" > /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is not running. Caching features will be limited."
        echo "   Start Redis with: sudo systemctl start redis"
    fi
else
    echo "ℹ️  Redis not installed. Caching features will be limited."
fi

echo ""
echo "🎯 Starting Ultimate OSINT Framework v2.0..."
echo ""

# Start the application
if [ "$1" = "dev" ]; then
    echo "🔧 Starting in development mode..."
    npm run dev
else
    echo "🚀 Starting in production mode..."
    npm start
fi 