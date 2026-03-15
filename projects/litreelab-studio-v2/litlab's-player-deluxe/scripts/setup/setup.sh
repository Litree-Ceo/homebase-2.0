#!/bin/bash
# SETUP SCRIPT FOR THE OVERLORD PROJECT
# This script will build a clean, professional monorepo structure from scratch.
# Run this from the root of the 'Overlord-Pc-Dashboard' directory in your WSL terminal.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Initial Check ---
echo "--- Checking for prerequisites (npm, node, python3) ---"
# Source nvm to ensure node and npm are found
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

command -v node >/dev/null 2>&1 || { echo >&2 "Node.js is required but it's not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "npm is required but it's not installed. Aborting."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo >&2 "Python 3 is required but it's not installed. Aborting."; exit 1; }
echo "--- Prerequisites met ---"

# --- Create Directory Structure ---
echo "
--- Creating new monorepo structure ---"
mkdir -p packages/frontend
mkdir -p packages/backend

# --- Backend Setup (Python + Flask) ---
echo "
--- Setting up Python Backend in packages/backend ---"
cd packages/backend

python3 -m venv venv
source venv/bin/activate

echo "
--- Installing Python dependencies (Flask) ---"
pip install Flask Flask-Cors
pip freeze > requirements.txt

echo "
--- Creating backend server file (app.py) ---"
cat <<'EOF' > app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Allow all origins for development

@app.route("/api/status")
def status():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
EOF

deactivate
cd ../../ # Return to project root

# --- Frontend Setup (React + Vite + Tailwind) ---
echo "
--- Setting up React Frontend in packages/frontend ---"
cd packages/frontend

# Ensure a clean slate for Vite project creation
rm -rf ./*

echo "\n--- Initializing new Vite + React project ---\n"
npm create vite@latest . -- --template react

echo "
--- Installing frontend dependencies ---"
npm install
npm install tailwindcss postcss autoprefixer react-router-dom react-icons

echo "
--- Configuring Tailwind CSS ---"
npx tailwindcss init -p

cat <<'EOF' > tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat <<'EOF' > src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cd ../../ # Return to project root

echo "

--- ✅ PROJECT SETUP COMPLETE! --- ✅"
echo "
Your new professional project structure is ready."
echo "
--- HOW TO RUN THE APPLICATION ---"
echo "
1. START THE BACKEND SERVER:"
echo "   - Open a new WSL terminal."
echo "   - Run: cd packages/backend && source venv/bin/activate && flask run --port=5001"
echo "
2. START THE FRONTEND SERVER:"
echo "   - Open another new WSL terminal."
echo "   - Run: cd packages/frontend && npm run dev"

echo "
Your React app will be available at http://localhost:5173"
echo "
"
