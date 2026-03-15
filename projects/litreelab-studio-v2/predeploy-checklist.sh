#!/bin/bash
# Pre-deployment checklist for LiTreeLabStudio

set -e

echo "Checking npm build..."
if [ ! -d "app_builder/web/dist" ]; then
  echo "ERROR: Frontend build missing. Run npm install && npm run build in app_builder/web."
  exit 1
fi

echo "Checking .env file..."
if [ ! -f ".env" ]; then
  echo "ERROR: .env file missing. Copy .env.template and fill in secrets."
  exit 1
fi

echo "Checking git status..."
git status

echo "Checking Docker build..."
docker-compose build

echo "Checklist complete. Ready for deployment!"
