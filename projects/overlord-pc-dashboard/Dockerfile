# ── Multi-stage build for Overlord PC Dashboard ─────────────────────────────────────
# Stage 1: Backend (Python/FastAPI)
FROM python:3.12-slim AS backend

WORKDIR /app

# Install Python dependencies
COPY requirements-new.txt .
RUN pip install --no-cache-dir -r requirements-new.txt

# Copy backend files
COPY main.py .
COPY config.yaml .
COPY models.py .

# Expose backend port
EXPOSE 8001

# Stage 2: Frontend (Node/Astro)
FROM node:20-alpine AS frontend

WORKDIR /app

# Copy and install frontend dependencies
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# Copy Astro source
COPY web/ ./

# Build Astro for production
RUN npm run build

# Expose frontend port
EXPOSE 4321

# ── Final Stage ───────────────────────────────────────────────────────────────────
FROM nginx:alpine

# Copy built frontend to nginx
COPY --from=frontend /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx/overlord.conf /etc/nginx/conf.d/default.conf

# Copy backend (for API server)
COPY --from=backend /app /app
COPY --from=backend /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

EXPOSE 80 8001

# Health check for backend
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8001/api/health')" || exit 1

# Start nginx and backend
CMD sh -c "nginx & python /app/main.py"
