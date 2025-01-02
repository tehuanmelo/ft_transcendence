# ft_transcendence

**Authors:**  
- Malik AlZubaidi - [maalzuba](#)  
- Paula Balbino - [pbalbino](#)  
- Samih Abdelrahman - [sabdelra](#)  
- Tanvir Ahmed Anas - [tanas](#)  
- Tehuan Melo - [tde-melo](#)

**Submission Date:** Nov. 28th, 2024  


## Table of Contents

1. [Project Description](#project-description)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
3. [Project Structure](#project-structure)  
4. [Installation](#installation)  
5. [Getting Started](#getting-started)  
5. [Running Tests](#running-tests)  
6. [Usage](#usage)  
7. [Troubleshooting](#troubleshooting)  


## Project Description

**ft_transcendence** is a web application designed to deliver a modern multiplayer gaming experience centered around the classic Pong game. This platform allows players to engage in real-time contests, customize gameplay, and explore additional games like Tic-Tac-Toe. With responsive design, enhanced security features, and accessibility considerations, it aims to offer an inclusive and seamless gaming experience.

**Why We Built This:**  
To combine technical innovation and user engagement, creating a platform that balances security, scalability, and immersive gameplay.



## Features

- **Gaming Options:**
  - Play Pong in 1v1 or 2v2 modes.
  - Experience Tic-Tac-Toe with matchmaking and user history.
  - Customize game settings (speed, difficulty, sound).

- **User Management:**
  - Secure registration and login using Two-Factor Authentication (2FA) and JSON Web Tokens (JWT).
  - Profile customization with avatars and display names.
  - Friends list with online status and messaging.

- **Accessibility & Compatibility:**
  - Optimized for visually impaired users with high-contrast themes and keyboard navigation.
  - Cross-browser support (Google Chrome and Firefox).

- **Security:**
  - HTTPS with TLS for secure data transmission.
  - Defense against SQL injections and XSS attacks.

- **Infrastructure:**
  - Built using Docker containers for scalability and maintainability.
  - Server-Side Rendering (SSR) for better performance and SEO.

---

## Technologies Used

- **Backend:** Django (Python)  
- **Frontend:** Vanilla JavaScript, Bootstrap, CSS  
- **Database:** PostgreSQL  
- **Authentication:** JSON Web Tokens (JWT), Two-Factor Authentication (2FA)  
- **Server:** Nginx (static files and reverse proxy)  
- **Containerization:** Docker  

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

## Installation

### Prerequisites

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

### Access the website at [https://localhost:443](https://localhost:443)

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

## Usage

### 1. Registration/Login:
Use the provided registration form or login with your username and password.

### 2. Gameplay:
Navigate to the game section to start a Pong or Tic-Tac-Toe match. Customize settings before starting.

### 3. Profile Management:
Edit your profile, upload an avatar, and view your match history.

### 4. Multiplayer Features:
Add friends, invite them to games, or send messages using the chat interface.

## Troubleshooting

- **Docker not running:** Ensure Docker is installed and running. Use `make check_docker` to check the status.
- **`.env` file missing:** Create a `.env` file with the necessary environment variables as shown above.
