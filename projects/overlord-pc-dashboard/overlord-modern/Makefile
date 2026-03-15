.PHONY: help install dev build test clean migrate

help:
	@echo "Overlord PC Dashboard - Available Commands"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development environment"
	@echo "  make build       - Build production images"
	@echo "  make test        - Run all tests"
	@echo "  make migrate     - Run database migrations"
	@echo "  make clean       - Clean up containers and volumes"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	docker-compose up --build

dev-backend:
	cd backend && uvicorn app.main:app --reload

dev-frontend:
	cd frontend && npm run dev

build:
	docker-compose -f docker-compose.yml build

test:
	cd backend && pytest
	cd frontend && npm test

test-backend:
	cd backend && pytest -v

test-frontend:
	cd frontend && npm test

migrate:
	cd backend && alembic upgrade head

makemigrations:
	cd backend && alembic revision --autogenerate -m "$(message)"

clean:
	docker-compose down -v
	docker system prune -f

format:
	cd backend && black app tests
	cd backend && isort app tests
	cd frontend && npm run format

lint:
	cd backend && flake8 app tests
	cd backend && mypy app
	cd frontend && npm run lint

logs:
	docker-compose logs -f

shell-backend:
	docker-compose exec backend /bin/bash

shell-db:
	docker-compose exec postgres psql -U overlord -d overlord
