# Agent Zero

This is a Dockerized setup for Agent Zero.

## Setup

1.  **Environment Variables**:
    Copy `.env.example` to `.env` and fill in your API keys:
    ```bash
    cp .env.example .env
    ```

2.  **Build and Run**:
    Use Docker Compose to build and start the agent:
    ```bash
    docker-compose up --build
    ```

## Structure

-   `Dockerfile`: Defines the Python environment.
-   `docker-compose.yml`: Orchestrates the container.
-   `main.py`: The entry point for the agent logic.
-   `requirements.txt`: Python dependencies.

## Customization

-   Add your agent logic to `main.py` or create new Python modules.
-   Update `requirements.txt` if you need more packages.
