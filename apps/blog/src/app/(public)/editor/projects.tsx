'use client'

import type { Project } from './types'

export const exampleProjects: Project[] = [
  {
    id: 'vanilla-js',
    name: 'Vanilla JavaScript',
    description: 'Vanilla JavaScript counter app',
    files: {
      'src/test.ts': `import path from 'path'
import { Effect } from 'effect'

Effect.runPromise(Effect.log(path.resolve(process.cwd())))`,
      'src/main.js': `let count = 0;

const countElement = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

function updateCount() {
  countElement.textContent = count;
  console.log('Count updated:', count);
}

incrementBtn.addEventListener('click', () => {
  count++;
  updateCount();
});

decrementBtn.addEventListener('click', () => {
  count--;
  updateCount();
});

console.log('Counter app initialized!');`,
      'dprint.json': JSON.stringify(
        {
          json: {
            indentWidth: 2,
            lineWidth: 120,
            trailingCommas: 'never',
          },
          typescript: {
            indentWidth: 2,
            lineWidth: 120,
            operatorPosition: 'maintain',
            semiColons: 'asi',
            quoteStyle: 'alwaysDouble',
            trailingCommas: 'never',
            'arrowFunction.useParentheses': 'force',
          },
          plugins: [
            '/vendor/dprint/plugins/json-0.19.3.wasm',
            '/vendor/dprint/plugins/typescript-0.93.0.wasm',
          ],
        },
        null,
        2
      ),
      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            allowSyntheticDefaultImports: true,
            exactOptionalPropertyTypes: true,
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            target: 'esnext',
          },
          include: ['src'],
        },
        null,
        2
      ),
      'package.json': JSON.stringify(
        {
          name: 'vanilla-js-example',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          devDependencies: {
            vite: '^5.0.0',
          },
        },
        null,
        2
      ),
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Counter App</title>
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <div id="app">
    <h1>Counter App</h1>
    <div class="counter">
      <button id="decrement">-</button>
      <span id="count">0</span>
      <button id="increment">+</button>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`,
      'src/style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.counter {
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: center;
}

button {
  width: 60px;
  height: 60px;
  font-size: 2rem;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #764ba2;
  transform: scale(1.1);
}

button:active {
  transform: scale(0.95);
}

#count {
  font-size: 3rem;
  font-weight: bold;
  color: #667eea;
  min-width: 100px;
}`,
    },
  },
  {
    id: 'react-todo',
    name: 'React Todo App',
    description: 'Interactive todo list with React',
    files: {
      'dprint.json': JSON.stringify(
        {
          json: {
            indentWidth: 2,
            lineWidth: 120,
            trailingCommas: 'never',
          },
          typescript: {
            indentWidth: 2,
            lineWidth: 120,
            operatorPosition: 'maintain',
            semiColons: 'asi',
            quoteStyle: 'alwaysDouble',
            trailingCommas: 'never',
            'arrowFunction.useParentheses': 'force',
          },
          plugins: [
            '/vendor/dprint/plugins/json-0.19.3.wasm',
            '/vendor/dprint/plugins/typescript-0.93.0.wasm',
          ],
        },
        null,
        2
      ),
      'package.json': JSON.stringify(
        {
          name: 'react-todo-app',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.2.0',
            vite: '^5.0.0',
          },
        },
        null,
        2
      ),
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Todo App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
      'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
      'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'src/App.jsx': `import { useState } from 'react';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
      console.log('Todo added:', input);
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    console.log('Todo deleted:', id);
  };

  return (
    <div className="app">
      <h1>My Todo List</h1>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <p className="stats">
        {todos.filter(t => !t.done).length} items left
      </p>
    </div>
  );
}`,
      'src/style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.app {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
}

h1 {
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

input[type="text"] {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  font-size: 1rem;
}

input[type="text"]:focus {
  outline: none;
  border-color: #f5576c;
}

button {
  padding: 0.75rem 1.5rem;
  background: #f5576c;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

button:hover {
  background: #f093fb;
}

.todo-list {
  list-style: none;
  margin-bottom: 1rem;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.todo-list li.done span {
  text-decoration: line-through;
  color: #999;
}

.todo-list li input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-list li span {
  flex: 1;
}

.todo-list li button {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  background: #ff4757;
}

.stats {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
}`,
    },
  },
  {
    id: 'node-express',
    name: 'Node.js Express API',
    description: 'Simple REST API with Express',
    files: {
      'dprint.json': JSON.stringify(
        {
          json: {
            indentWidth: 2,
            lineWidth: 120,
            trailingCommas: 'never',
          },
          typescript: {
            indentWidth: 2,
            lineWidth: 120,
            operatorPosition: 'maintain',
            semiColons: 'asi',
            quoteStyle: 'alwaysDouble',
            trailingCommas: 'never',
            'arrowFunction.useParentheses': 'force',
          },
          plugins: [
            '/vendor/dprint/plugins/json-0.19.3.wasm',
            '/vendor/dprint/plugins/typescript-0.93.0.wasm',
          ],
        },
        null,
        2
      ),
      'package.json': JSON.stringify(
        {
          name: 'express-api',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'node src/server.js',
          },
          dependencies: {
            express: '^4.18.2',
          },
        },
        null,
        2
      ),
      'src/server.js': `import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

let items = [
  { id: 1, name: 'Item 1', description: 'First item' },
  { id: 2, name: 'Item 2', description: 'Second item' },
];

// Get all items
app.get('/api/items', (req, res) => {
  console.log('GET /api/items');
  res.json(items);
});

// Get single item
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// Create item
app.post('/api/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    description: req.body.description,
  };
  items.push(newItem);
  console.log('Created item:', newItem);
  res.status(201).json(newItem);
});

// Delete item
app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  items.splice(index, 1);
  console.log('Deleted item:', req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
  console.log('Available endpoints:');
  console.log('  GET    /api/items');
  console.log('  GET    /api/items/:id');
  console.log('  POST   /api/items');
  console.log('  DELETE /api/items/:id');
});`,
    },
  },
]
