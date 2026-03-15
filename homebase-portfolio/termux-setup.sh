#!/bin/bash
# Termux Setup Script for HomeBase Pro
# Run this in Termux to set up your development environment

echo "🚀 Setting up HomeBase Pro in Termux..."

# Update packages
pkg update -y
pkg upgrade -y

# Install essential packages
pkg install -y git nodejs-lts vim nano curl openssh

# Install Firebase CLI globally
npm install -g firebase-tools

# Git configuration (you'll need to set these)
echo ""
echo "⚠️  Configure Git with your credentials:"
echo "   git config --global user.name 'Your Name'"
echo "   git config --global user.email 'your@email.com'"

# Create projects directory
mkdir -p ~/projects
cd ~/projects

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. Clone your repo:"
echo "   cd ~/projects"
echo "   git clone https://github.com/Litlabsai/homebase-portfolio.git"
echo "   cd homebase-portfolio"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo ""
echo "3. Start dev server:"
echo "   npm run dev"
echo ""
echo "4. Build for production:"
echo "   npm run build"
echo ""
echo "📱 Access your dev server at http://localhost:5173"
echo "   (Use 'ifconfig' to find your phone's IP for LAN access)"
echo ""
