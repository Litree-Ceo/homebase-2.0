# Chapter 3: Development Workflow

## 3.1. Local Environment Setup

To establish a local development environment, follow these steps:

1.  **Clone the Repository**: `git clone <repository_url>`
2.  **Install Python Dependencies**: `pip install -r requirements.txt`
3.  **Install Node.js Dependencies**: `npm install`
4.  **Configure Environment**: Copy `.env.example` to `.env` and populate it with the necessary API keys and secrets.

## 3.2. Running the Application

The application consists of two primary processes that must be run concurrently:

1.  **Python Backend**: This server handles API requests and data collection. Start it with:
    ```bash
    python server.py
    ```
2.  **Vite Frontend Server**: This server provides the user interface with hot-reloading. Start it with:
    ```bash
    npm run dev
    ```

Once both servers are running, the application will be accessible at `http://localhost:3000`.

## 3.3. Testing Protocol

The project maintains two separate test suites:

- **Python Tests (pytest)**: These tests cover the backend logic. Run them with:
  ```bash
  pytest tests/ -v
  ```
- **JavaScript Tests (Jest)**: These tests cover any frontend logic. Run them with:
  ```bash
  npm test
  ```

All tests must pass before any code is merged into the main branch.
