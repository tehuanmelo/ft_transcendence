# ---------------------------------------------------------------------------- #
#                                   VARIABLES                                  #
# ---------------------------------------------------------------------------- #
DOCKER_COMPOSE:= docker compose -f ./docker-compose.yml
VOL_PONGDB:= $(PWD)/pongdb


# ---------------------------------------------------------------------------- #
#                                    TARGETS                                   #
# ---------------------------------------------------------------------------- #

all: up

up:
	@if [ ! -d $(VOL_PONGDB) ]; then \
		echo "Creating volumes..."; \
		mkdir -p $(VOL_PONGDB); \
	fi
	$(DOCKER_COMPOSE) up --build --detach

down:
	$(DOCKER_COMPOSE) down

nuke:
	docker system prune -a 

clean:
	$(DOCKER_COMPOSE) down --rmi all --volumes

fclean: clean nuke

re: fclean up

.PHONY: all up down re nuke clean fclean
