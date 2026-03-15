#!/bin/bash

# Firebase MCP Server Setup Script

echo "Firebase MCP Server Setup"
echo "========================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "Please login to Firebase if prompted..."
firebase login

# List available projects
echo "Available Firebase projects:"
firebase projects:list

echo ""
echo "Setup Instructions:"
echo "1. Copy your Firebase project ID from the list above"
echo "2. Replace '[projectId]' in the config with your actual project ID"
echo "3. Generate a service account key:"
echo "   - Go to Firebase Console > Project Settings > Service Accounts"
echo "   - Click 'Generate new private key'"
echo "   - Save the JSON file securely"
echo "   - Update SERVICE_ACCOUNT_KEY_PATH with the full path to this file"
echo ""
echo "Config file location: C:\\Users\\litre\\AppData\\Roaming\\Claude\\claude_desktop_config.json"