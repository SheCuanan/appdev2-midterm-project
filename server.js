const http = require('http');
const fs = require('fs');
const { EventEmitter } = require('events');

const PORT = 3000;
const todosFile = 'todos.json';
const logFile = 'logs.txt';

// Create the files todo.json and log.txt
if (!fs.existsSync(todosFile)) fs.writeFileSync(todosFile, '[]');
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, '');

const logger = new EventEmitter();

// Log to logs.txt with timestamp
logger.on('log', (message) => {
  const time = new Date().toISOString();
  fs.appendFile(logFile, `${time} - ${message}\n`, (err) => {
    if (err) console.log('Could not write log');
  });
});

// Read todos from file
function readTodos(callback, errorCallback) {
  fs.readFile(todosFile, 'utf8', (err, data) => {
    if (err) return errorCallback(err);
    try {
      const todos = JSON.parse(data);
      callback(todos);
    } catch (e) {
      errorCallback(e);
    }
  });
}

// Write todos to file
function writeTodos(todos, callback, errorCallback) {
  fs.writeFile(todosFile, JSON.stringify(todos, null, 2), (err) => {
    if (err) return errorCallback(err);
    callback();
  });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;

  logger.emit('log', `${method} ${url}`);

  // GET /todos
  if (method === 'GET' && url === '/todos') {
    readTodos(
      (todos) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(todos));
      },
      () => {
        res.writeHead(500);
        res.end('Server error');
      }
    );

  // GET specific todos id
  } else if (method === 'GET' && url.startsWith('/todos/')) {
    const id = parseInt(url.split('/')[2]);

    readTodos(
      (todos) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(todo));
        } else {
          res.writeHead(404);
          res.end('Todo not found');
        }
      },
      () => {
        res.writeHead(500);
        res.end('Server error');
      }
    );

  // POST todos
  } else if (method === 'POST' && url === '/todos') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const newTodo = JSON.parse(body);
        if (!newTodo.title) {
          res.writeHead(400);
          res.end('Title is required');
          return;
        }

        readTodos(
          (todos) => {
            const newId = todos.length ? todos[todos.length - 1].id + 1 : 1;
            const todo = {
              id: newId,
              title: newTodo.title,
              completed: newTodo.completed || false
            };

            todos.push(todo);

            writeTodos(
              todos,
              () => {
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(todo));
              },
              () => {
                res.writeHead(500);
                res.end('Server error');
              }
            );
          },
          () => {
            res.writeHead(500);
            res.end('Server error');
          }
        );
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });

  // PUT specific todos id
  } else if (method === 'PUT' && url.startsWith('/todos/')) {
    const id = parseInt(url.split('/')[2]);
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updates = JSON.parse(body);

        readTodos(
          (todos) => {
            const index = todos.findIndex(t => t.id === id);
            if (index === -1) {
              res.writeHead(404);
              res.end('Todo not found');
              return;
            }

            if (updates.title !== undefined) {
              todos[index].title = updates.title;
            }
            if (updates.completed !== undefined) {
              todos[index].completed = updates.completed;
            }

            writeTodos(
              todos,
              () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(todos[index]));
              },
              () => {
                res.writeHead(500);
                res.end('Server error');
              }
            );
          },
          () => {
            res.writeHead(500);
            res.end('Server error');
          }
        );
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });

  // DELETE specific todos id
  } else if (method === 'DELETE' && url.startsWith('/todos/')) {
    const id = parseInt(url.split('/')[2]);

    readTodos(
      (todos) => {
        const index = todos.findIndex(t => t.id === id);
        if (index === -1) {
          res.writeHead(404);
          res.end('Todo not found');
          return;
        }

        const deleted = todos.splice(index, 1)[0];

        writeTodos(
          todos,
          () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Todo deleted', todo: deleted }));
          },
          () => {
            res.writeHead(500);
            res.end('Server error');
          }
        );
      },
      () => {
        res.writeHead(500);
        res.end('Server error');
      }
    );

  // Fallback 404 Not Found
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
