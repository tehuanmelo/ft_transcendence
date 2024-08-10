# ---------------------------------------------------------------------------- #
#                                   VARIABLES                                  #
# ---------------------------------------------------------------------------- #
DOCKER_COMPOSE:= docker-compose -f ./docker-compose.yml
VOL_PONGFRONTEND:= $(PWD)/pong-frontend
VOL_USERDB:= $(PWD)/userdb


# ---------------------------------------------------------------------------- #
#                                    TARGETS                                   #
# ---------------------------------------------------------------------------- #

all: up

up:
	@if [ ! -d $(VOL_PONGFRONTEND) ] ||  [ ! -d $(VOL_USERDB) ]; then \
		echo "Creating volumes..."; \
		mkdir -p $(VOL_PONGFRONTEND) $(VOL_USERDB); \
	fi
	$(DOCKER_COMPOSE) up --build --detach

down:
	$(DOCKER_COMPOSE) down

nuke:
	@echo "This option will remove all your running containers and images, do you want to continue? (y/n)?"; \
	read answer; \
	if [ "$$answer" != "$${answer#[Yy]}" ]; then \
		docker system prune -a \
		echo "All containers and images have been removed"; \
	else \
		echo "No containers or images have been removed"; \
		exit 0; \
	fi

clean:
	$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean nuke

re: fclean up

.PHONY: all up down re nuke clean fclean
