.PHONY: install build start dev test lint format docker-up docker-down docker-logs

# Local Development
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

# Docker Commands
docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down -v

docker-logs:
	docker-compose logs -f api