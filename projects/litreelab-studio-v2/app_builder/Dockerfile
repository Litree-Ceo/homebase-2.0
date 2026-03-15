# Multi-stage Dockerfile for FastAPI backend + React frontend

# Stage 1: Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY web/ ./
RUN npm run build

# Stage 2: Build FastAPI backend
FROM python:3.14-slim AS backend-build
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Stage 3: Final image
FROM python:3.14-slim
WORKDIR /app
COPY --from=backend-build /app .
COPY --from=frontend-build /app/web/dist ./web/dist

# Expose port for FastAPI
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
