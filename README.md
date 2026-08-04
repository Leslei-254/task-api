# Task API

A RESTful CRUD API built with **Node.js**, **Express.js**, and **PostgreSQL**. The application is containerized using **Docker** and **Docker Compose**, allowing the API and database to start together with a single command.

## Features

* Create tasks
* Read all tasks
* Read a single task
* Update tasks
* Delete tasks
* PostgreSQL database
* Docker Compose support
* Swagger API documentation

---

## Technologies Used

* Node.js
* Express.js
* PostgreSQL 17
* Docker
* Docker Compose
* Swagger UI Express

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Leslei-254/task-api.git
```

Navigate to the project:

```bash
cd task-api
```

Install dependencies (optional when using Docker):

```bash
npm install
```

---

## Environment Variables

Create a `.env` file from `.env.example`.

Example:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
PORT=3000
```

---

## Running with Docker Compose (Recommended)

Start the entire application stack:

```bash
docker compose up
```

This command starts:

* PostgreSQL
* Task API

The API will be available at:

```
http://localhost:3000
```

Swagger documentation:

```
http://localhost:3000/docs
```

---

## Running Without Docker

Start PostgreSQL manually, then run:

```bash
npm start
```

or during development:

```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint   | Description     |
| ------ | ---------- | --------------- |
| GET    | /          | API information |
| GET    | /health    | Health check    |
| GET    | /tasks     | Get all tasks   |
| GET    | /tasks/:id | Get task by ID  |
| POST   | /tasks     | Create task     |
| PUT    | /tasks/:id | Update task     |
| DELETE | /tasks/:id | Delete task     |

---

## Example Requests

### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Learn PostgreSQL\"}"
```

### Get All Tasks

```bash
curl http://localhost:3000/tasks
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
-H "Content-Type: application/json" \
-d "{\"title\":\"Master PostgreSQL\",\"done\":true}"
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

---

## Project Structure

```
task-api/
│── Dockerfile
│── docker-compose.yml
│── .dockerignore
│── .gitignore
│── .env.example
│── package.json
│── package-lock.json
│── server.js
│── openapi.json
│── README.md
│── swagger-screenshot.png
```

---

## Architecture

This project originally stored tasks in an in-memory JavaScript array.

For this assignment, the storage layer was replaced with PostgreSQL while keeping the API endpoints unchanged. The application now persists data in a PostgreSQL database running inside Docker.

---

## Database

The application automatically creates the `tasks` table if it does not already exist.

PostgreSQL runs inside a Docker container and stores its data in a persistent Docker volume.

---

## Persistence Verification

Persistence was verified by:

1. Starting the application using `docker compose up`.
2. Creating new tasks through the API.
3. Stopping the application containers.
4. Starting the containers again.
5. Retrieving the tasks and confirming that the previously created records still existed.

This confirms that the PostgreSQL Docker volume preserves data across container restarts.

---

## Assignment Requirements Completed

* PostgreSQL running in Docker
* Docker Compose for the complete application stack
* Persistent Docker volume
* Environment variables stored in `.env`
* `.env.example` committed
* PostgreSQL replacing the in-memory task storage
* CRUD operations using PostgreSQL
* Data persistence verified after restarting containers

---

## Swagger UI

After starting the application, open:

```
http://localhost:3000/docs
```

Swagger UI screenshot:

![Swagger UI](swagger-screenshot.png)

---

## Author

**Leslei Makori**

GitHub: https://github.com/Leslei-254
