# appdev2-midterm-project

 Building a CRUD HTTP Server Using the File System Module


## Student Information:
- Sherelyn Cuanan from BSIS 3
- AppDev2
- Due Date: April 19

---

## Project Description

This project is a simple **RESTful API** built using **Node.js** and **fs modules**. It mimics the functionality of a TODO list API similar to JSONPlaceholder.

Instead of a database, it uses a **JSON file (`todos.json`)** to store the data, and logs all actions to a **log file (`logs.txt`)**.

---

## Here are the following endpoits:

- `GET /todos` – fetch all todos
- `GET /todos/:id` – Get a specific todo by ID
- `POST /todos` – Add a new todo
- `PUT /todos/:id` – Update a todo by ID
- `DELETE /todos/:id` – Delete a todo by ID
- Request logs saved in `logs.txt` with timestamps

---

## How to Run the Project

You can **Clone or download** the repository:

```bash
git clone https://github.com/yourusername/appdev2-midterm-project.git
cd appdev2-midterm-project

## Run the server using Node:

node server.js

## the server will start on 

http://localhost:3000
```
-----

## Here is my short video demonstration of my API:

https://drive.google.com/file/d/1-W0gXdpKIVzUkJ9UdMwr1BKfUxy3xhKV/view?usp=sharing