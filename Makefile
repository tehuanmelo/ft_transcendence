# ---------------------------------------------------------------------------- #
#                                   VARIABLES                                  #
# ---------------------------------------------------------------------------- #
DOCKER_COMPOSE:= docker compose -f ./docker-compose.yml

# ---------------------------------------------------------------------------- #
#                                COLOR VARIABLES                               #
# ---------------------------------------------------------------------------- #
RED=\033[31m
BOLD_BLUE=\033[1;34m
RESET=\033[0m

# ---------------------------------------------------------------------------- #
#                                    TARGETS                                   #
# ---------------------------------------------------------------------------- #

include .env

all: up

check_docker: check_env
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

check_env:
	@if [ ! -f .env ]; then \
		echo "$(RED).env file is missing! Cannot proceed without it. 😵$(RESET)"; \
		echo "Please create the $(BOLD_BLUE).env$(RESET) file with the necessary environment variables."; \
		exit 1; \
	fi

up: check_docker
	$(DOCKER_COMPOSE) up --build --detach
	@echo "Access the website at https://localhost:443"

down: check_docker
	$(DOCKER_COMPOSE) down

nuke: check_docker
	@echo "$(RED)Nuking docker files... ☢️$(RESET)";
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans

clean: check_docker
	@echo "$(RED)Initiating clean... 🧹$(RESET)";
	@if [ -d ./backend/media/ ]; then \
		if $(DOCKER_COMPOSE) ps | grep django > /dev/null; then \
			echo "$(RED)Deleting media files in Django container...$(RESET)"; \
			$(DOCKER_COMPOSE) exec django rm -rf ./backend/media/*; \
		fi \
	fi
	@if [ -d ./backend/users/migrations/ ]; then \
		if $(DOCKER_COMPOSE) ps | grep django > /dev/null; then \
			echo "$(RED)Deleting migrations files in Django container...$(RESET)"; \
			$(DOCKER_COMPOSE) exec django rm -rf ./backend/users/migrations; \
		fi \
	fi
	@if [ -f ./backend/db.sqlite3 ]; then \
		echo "$(RED)Deleting SQLite database...$(RESET)"; \
		rm -rf ./backend/db.sqlite3; \
	fi
	$(DOCKER_COMPOSE) down --rmi local --volumes --remove-orphans

fclean: clean nuke
	@echo "$(RED)Clean complete 🧼$(RESET)";

re: fclean up

# run container in shell
exec-%: check_docker
	$(DOCKER_COMPOSE) exec -it $* /bin/sh

run-database: check_docker
	$(DOCKER_COMPOSE) exec -it postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

show-users: check_docker
	$(DOCKER_COMPOSE) exec postgres psql -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT * FROM users_customuser;"

.PHONY: all check_docker check_env up down nuke clean fclean re exec-% run-database show-users
