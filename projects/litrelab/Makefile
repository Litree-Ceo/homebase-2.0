# Litrelab Docker Makefile
# Quick commands for managing the stack

.PHONY: help build up down dev logs shell-backend shell-frontend clean

# Default target
help:
	@echo "Litrelab Docker Commands:"
	@echo "  make build      - Build production images"
	@echo "  make up         - Start production stack"
	@echo "  make down       - Stop all containers"
	@echo "  make dev        - Start development stack with hot reload"
	@echo "  make logs       - View logs from all services"
	@echo "  make shell-be   - Open shell in backend container"
	@echo "  make shell-fe   - Open shell in frontend container"
	@echo "  make clean      - Remove all containers and volumes"
	@echo "  make test       - Run backend tests"

# Production commands
build:
	docker-compose -f docker-compose.litrelab.yml build --parallel

up:
	docker-compose -f docker-compose.litrelab.yml up -d

down:
	docker-compose -f docker-compose.litrelab.yml down

logs:
	docker-compose -f docker-compose.litrelab.yml logs -f

# Development commands
dev:
	docker-compose -f docker-compose.litrelab.dev.yml up

dev-build:
	docker-compose -f docker-compose.litrelab.dev.yml build

dev-down:
	docker-compose -f docker-compose.litrelab.dev.yml down

# Utility commands
shell-be:
	docker-compose -f docker-compose.litrelab.yml exec backend /bin/bash

shell-fe:
	docker-compose -f docker-compose.litrelab.yml exec frontend /bin/sh

test:
	docker-compose -f docker-compose.litrelab.yml exec backend uv run pytest

clean:
	docker-compose -f docker-compose.litrelab.yml down -v
	docker-compose -f docker-compose.litrelab.dev.yml down -v
	docker system prune -f

# Quick health check
health:
	@echo "Checking backend health..."
	@curl -s http://localhost:8000/status | python -m json.tool || echo "Backend not responding"
	@echo "\nChecking frontend..."
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:4321 | grep -q "200" && echo "Frontend OK" || echo "Frontend not responding"
