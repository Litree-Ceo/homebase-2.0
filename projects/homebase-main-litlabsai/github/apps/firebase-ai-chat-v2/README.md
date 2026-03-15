# Firebase AI Chat

This project is a Firebase Cloud Functions backend with an Express server, designed for AI chat integration.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file (already created) and set:
    - `PORT` (default: 8080)
    - `GOOGLE_APPLICATION_CREDENTIALS` (path to your service account key, if running locally without `gcloud auth`)

3.  **Run Locally:**
    Start the server:
    ```bash
    npm start
    ```
    Verify it's running:
    ```bash
    curl http://localhost:8080
    ```
    Test the chat endpoint:
    ```bash
    curl -X POST http://localhost:8080/chat -H "Content-Type: application/json" -d '{"message": "Hello World"}'
    ```

## Deployment

To deploy to Firebase Cloud Functions:

1.  **Login to Firebase:**
    ```bash
    firebase login
    ```

2.  **Initialize Project (if not already):**
    ```bash
    firebase use --add
    ```

3.  **Deploy:**
    ```bash
    firebase deploy --only functions
    ```

## Features

- **Express Server:** Handles HTTP requests.
- **Firebase Admin SDK:** Initialized for database/auth operations.
- **AI Integration Placeholder:** Ready for Google Cloud Vertex AI integration in `index.js`.
