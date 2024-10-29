# ft_transcendence

A multi-game web application including Pong and Tic Tac Toe, built with Django and Docker.

## Project Structure

```
.
├── Makefile
├── README.md
├── backend
│   ├── admin
│   ├── game
│   ├── pages
│   ├── static
│   ├── templates
│   └── users
├── containers
│   ├── django
│   └── nginx
└── docker-compose.yml
```

## Prerequisites

Ensure the following are installed on your system:

- **Docker** - [Get Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** - Comes bundled with Docker Desktop. For Linux, you may need to install separately.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Taanviir/ft_transcendence.git
cd ft_transcendence
```

### 2. Create the `.env` File

Create a `.env` file in the project root and define the necessary environment variables:

```bash
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DB=your_postgres_db
```

Check the [.env.example](.env.example) file for reference.

### 3. Using the Makefile

The Makefile provides convenient commands to manage your Docker environment and project setup. Key targets include:

| Command             | Description                                               |
|---------------------|-----------------------------------------------------------|
| `make up`           | Builds and starts all containers in detached mode         |
| `make down`         | Stops and removes containers                              |
| `make nuke`         | Removes all containers, images, volumes, and networks     |
| `make clean`        | Cleans up database and migration files                    |
| `make fclean`       | Executes `clean` and `nuke`                               |
| `make re`           | Restarts the Docker environment                           |
| `make exec-<service>` | Opens a shell in the specified service (e.g., `django`) |
| `make show-users`   | Displays all users in the custom Django user model        |

### 4. Running the Application

To start the application, run:

```bash
make up
```

Access the website at [https://localhost:443](https://localhost:443).

To stop the application, run:

```bash
make down
```

### 5. Cleaning Up

To delete database and media files without removing images, use:

```bash
make clean
```

To remove all Docker resources, including images and volumes, run:

```bash
make nuke
```

## Running Tests

To run tests for individual apps (e.g., `game`):

```bash
make exec-django
python manage.py test game
```

### Database Access

To access the PostgreSQL database, use:

```bash
make run-database
```

## Troubleshooting

- **Docker not running:** Ensure Docker is installed and running. Use `make check_docker` to check the status.
- **`.env` file missing:** Create a `.env` file with the necessary environment variables as shown above.
