# ---------------------------------------------------------------------------- #
#                                   VARIABLES                                  #
# ---------------------------------------------------------------------------- #
DOCKER_COMPOSE:= docker compose -f ./docker-compose.yml
VOL_PONGDB:= $(PWD)/pongdb

# ---------------------------------------------------------------------------- #
#                                COLOR VARIABLES                               #
# ---------------------------------------------------------------------------- #
RED=\033[31m
BOLD_BLUE=\033[1;34m
RESET=\033[0m

# ---------------------------------------------------------------------------- #
#                                    TARGETS                                   #
# ---------------------------------------------------------------------------- #

all: up migrations migrate

check_docker:
	@if ! docker info > /dev/null 2>&1; then \
		if ! command -v docker > /dev/null 2>&1; then \
			echo "$(RED)Docker is not installed.$(RESET) 😨"; \
			exit 1; \
		else \
			echo "$(RED)Docker is not running.$(RESET) 😨"; \
			echo "Please start $(BOLD_BLUE)Docker 🐳$(RESET) and try again."; \
			exit 1; \
		fi \
	else \
		echo "$(BOLD_BLUE)Docker is running successfully! 🐳$(RESET)"; \
	fi

up: check_docker
	@if [ ! -d $(VOL_PONGDB) ]; then \
		echo "Creating volumes 📂 ..."; \
		mkdir -p $(VOL_PONGDB); \
	fi
	$(DOCKER_COMPOSE) up --build --detach
	@echo "Access the app at https://localhost:443"

down: check_docker
	$(DOCKER_COMPOSE) down

migrate:
	@docker-compose exec django sh -c "cd pong-backend && python manage.py migrate"

migrations:
	@docker-compose exec django sh -c "cd pong-backend && python manage.py makemigrations users"

nuke: check_docker
	docker system prune -a 

clean: check_docker
	$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean nuke

re: fclean up

# run container in shell
exec-%:
	$(DOCKER_COMPOSE) exec -it $* /bin/sh

.PHONY: all check_docker up down re nuke clean fclean exec-%
