# Task API

A simple RESTful CRUD API built with **Node.js**, **Express.js**, and **Swagger UI**.

## Features

- Create tasks
- Read all tasks
- Read a single task
- Update tasks
- Delete tasks
- Swagger API documentation

---

## Technologies Used

- Node.js
- Express.js
- Swagger UI Express

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

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm run dev
```

The API runs at:

```
http://localhost:3000
```

Swagger documentation:

```
http://localhost:3000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | API information |
| GET | /health | Health check |
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get task by ID |
| POST | /tasks | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

---

## Example Requests

### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
-H "Content-Type: application/json" \
-d "{\"title\":\"Buy milk\"}"
```

Response

```json
{
  "id": 4,
  "title": "Buy milk",
  "done": false
}
```

---

### Get All Tasks

```bash
curl http://localhost:3000/tasks
```

---

### Update a Task

```bash
curl -X PUT http://localhost:3000/tasks/1 \
-H "Content-Type: application/json" \
-d "{\"title\":\"Learn Express\",\"done\":true}"
```

---

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

---

## Project Structure

```
task-api/
│── node_modules/
│── server.js
│── openapi.json
│── package.json
│── package-lock.json
│── README.md
```

---

## Swagger UI

After starting the server, open:

```
http://localhost:3000/docs
```

Add a screenshot of your Swagger UI below.

![Swagger UI](swagger-screenshot.png)

---

## Author

**Leslei Makori**

GitHub: https://github.com/Leslei-254