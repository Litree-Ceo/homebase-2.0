# Chapter 5: Deployment and Operations

## 5.1. Deployment via Docker

The recommended method for deploying the Overlord PC Dashboard is via Docker and Docker Compose. This ensures a consistent and reproducible environment.

1.  **Build and Run**: The following command will build the Docker image and start the container in detached mode.
    ```bash
    docker-compose up -d
    ```
2.  **Verify**: The application will be available at `http://localhost:8080`.

## 5.2. Deployment via Firebase

The project is also configured for deployment to Firebase Hosting and Functions.

1.  **Install Firebase CLI**: `npm install -g firebase-tools`
2.  **Login to Firebase**: `firebase login`
3.  **Deploy**: The following commands will deploy the frontend and backend components respectively.
    - **Hosting (Frontend)**: `firebase deploy --only hosting`
    - **Functions (Backend)**: `firebase deploy --only functions`

## 5.3. Pre-commit Checks

Before any code is committed, the following checks must be run to ensure code quality and prevent regressions:

- **Python Linting**: `pylint *.py`
- **Python Type Checking**: `pyright`
- **Python Tests**: `pytest tests/ -v`
