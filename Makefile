.PHONY: help install build start dev test lint format docker-up docker-down docker-logs

# Default target when running just 'make'
.DEFAULT_GOAL := help

## help: Show this help message
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed 's/^/  /'

# ==========================
# Local Development
# ==========================

## install: Install project dependencies
install:
	npm install

## build: Build the application for production
build:
	npm run build

## start: Start the application in production mode
start:
	npm run start:prod

## dev: Start the application in development mode (with hot-reload)
dev:
	npm run start:dev

## test: Run unit tests
test:
	npm run test

## lint: Run ESLint to check for code issues
lint:
	npm run lint

## format: Format code using Prettier
format:
	npm run format

# ==========================
# Docker Commands
# ==========================

## docker-up: Build and start Docker containers in the background
docker-up:
	docker compose up -d --build

## docker-down: Stop and remove Docker containers and volumes
docker-down:
	docker compose down -v

## docker-logs: View live logs for the API container
docker-logs:
	docker compose logs -f api