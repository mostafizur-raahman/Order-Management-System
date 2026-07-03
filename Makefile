.PHONY: help install build start dev test lint format docker-up docker-down docker-logs

# Default target when running just 'make'
.DEFAULT_GOAL := help


help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | column -t -s ':' | sed 's/^/  /'

# ==========================
# Local Development
# ==========================

install:
	npm install

build:
	npm run build


start:
	npm run start:prod

dev:
	npm run start:dev

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

# ==========================
# Docker Commands
# ==========================

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down -v

docker-logs:
	docker compose logs -f api