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

all: up

check_docker:
	@if ! docker info > /dev/null 2>&1; then \
		echo "$(RED)Docker is not running.$(RESET) 😨"; \
		echo "Please start $(BOLD_BLUE)Docker 🐳$(RESET) and try again."; \
		exit 1; \
	fi

up: check_docker
	@if [ ! -d $(VOL_PONGDB) ]; then \
		echo "Creating volumes..."; \
		mkdir -p $(VOL_PONGDB); \
	fi
	$(DOCKER_COMPOSE) up --build --detach

down: check_docker
	$(DOCKER_COMPOSE) down

nuke: check_docker
	docker system prune -a 

clean: check_docker
	$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean nuke

re: fclean up

.PHONY: all check_docker up down re nuke clean fclean
