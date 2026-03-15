# ── Build stage (just needs python + deps) ──────────────────────────────────
FROM python:3.12-slim AS base

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY server.py config.yaml index.html style.css ./

# ── Runtime ──────────────────────────────────────────────────────────────────
EXPOSE 8080

# Run as non-root for security
RUN adduser --disabled-password --gecos "" overlord
USER overlord

# Logs go to stdout in containers; file logging will also write to /app/overlord.log
CMD ["python", "-u", "server.py"]
