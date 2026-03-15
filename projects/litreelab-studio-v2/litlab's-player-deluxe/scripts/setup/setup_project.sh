#!/bin/bash
# This script will set up the entire Overlord project in a clean monorepo structure.
# Please run this script from the root of the 'Overlord-Pc-Dashboard' directory in your WSL terminal.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Backend Setup ---
echo "
--- Setting up Python Backend ---"
cd packages/backend

# Create virtual environment
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install Flask Flask-Cors

# Create requirements.txt
pip freeze > requirements.txt

# Create backend server file
cat <<'EOF' > app.py
from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app) # Allow requests from our frontend

# This is a simplified version of your movie_db.py for demonstration
# In a real app, you would import your class

def get_movies_from_db():
    # In a real scenario, this would connect to your existing DB
    # For now, we return mock data to get the frontend working
    return [
        {'id': 1, 'title': 'Blade Runner 2049', 'genre': 'Cyberpunk', 'posterURL': 'https://via.placeholder.com/400x600.png?text=Blade+Runner'},
        {'id': 2, 'title': 'Dune: Part Two', 'genre': 'Sci-Fi', 'posterURL': 'https://via.placeholder.com/400x600.png?text=Dune'},
        {'id': 3, 'title': 'Ghost in the Shell', 'genre': 'Anime', 'posterURL': 'https://via.placeholder.com/400x600.png?text=GITS'},
    ]

@app.route('/api/movies', methods=['GET'])
def get_movies():
    movies = get_movies_from_db()
    return jsonify(movies)

if __name__ == '__main__':
    app.run(debug=True, port=5001)

EOF'

deactivate
cd ../../

# --- Frontend Setup ---
echo "
--- Setting up Node.js Frontend ---"
cd packages/frontend

# Install npm dependencies
npm install

cd ../../

echo "
--- Project Setup Complete! ---"
echo "To run the application:"
echo "1. Open a new WSL terminal and run: 'cd packages/backend && source venv/bin/activate && flask run --port=5001'"
echo "2. Open another new WSL terminal and run: 'cd packages/frontend && npm run dev'"
