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

all: up

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
	@if [ ! -f .env ]; then \
		echo "$(RED).env file is missing! Cannot proceed without it. 😵$(RESET)"; \
		echo "Please create the $(BOLD_BLUE).env$(RESET) file with the necessary environment variables."; \
		exit 1; \
	fi
	$(DOCKER_COMPOSE) up --build --detach
	@echo "Access the website at https://localhost:443"

down: check_docker
	$(DOCKER_COMPOSE) down

nuke: check_docker
	@echo "$(RED)Nuking docker files... ☢️$(RESET)";
	docker system prune -a -f

clean: check_docker
	@echo "$(RED)Initiating clean... 🧹$(RESET)";
	$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean nuke
	@echo "$(RED)Clean complete 🧼$(RESET)";

re: fclean up

# run container in shell
exec-%:
	$(DOCKER_COMPOSE) exec -it $* /bin/sh

.PHONY: all check_docker up down re nuke clean fclean exec-%
