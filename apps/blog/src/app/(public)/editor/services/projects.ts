'use client'

import type { Project } from './types'

export const exampleProjects: Project[] = [
  {
    id: 'ffmpeg-stream',
    name: 'Effect Stream FFmpeg',
    description: 'Effect Stream with FFmpeg',
    files: {
      'src/main.ts': `import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { FileSystem } from '@effect/platform'
import { NodeFileSystem, NodeSink, NodeStream } from '@effect/platform-node'
import { Array, Cause, Effect, Stream } from 'effect'

const download = FileSystem.FileSystem.pipe(
  Stream.flatMap((fs) =>
    fs
      .stream('./in.mp3')
      .pipe(
        Stream.tap((chunk) =>
          Effect.log(\`Downloaded chunk of size: \${chunk.byteLength}\`)
        )
      )
  )
)

const upload = NodeSink.fromWritable(
  () => createWriteStream('./out1.mp3'),
  () => new Error()
)

const upload2 = NodeSink.fromWritable(
  () => createWriteStream('./out2.mp3'),
  () => new Error()
)

Effect.all({
  download: Effect.succeed(download),
  uploads: Effect.succeed([
    [upload, ['-i', '-', '-ar', '44100', '-f', 'mp3', '-']],
    [upload2, ['-i', '-', '-ar', '44100', '-f', 'mp3', '-']],
  ] as const),
})
  .pipe(
    Effect.flatMap(({ download, uploads }) =>
      Effect.forEach(
        Array.flatMap(uploads, ([upload, args]) => {
          const child = spawn('ffmpeg', args, {
            stdio: ['pipe', 'pipe', 'pipe'],
          })
          const stdin = NodeSink.fromWritable(
            () => child.stdin,
            (cause) => new Cause.UnknownException(cause)
          )
          const stdout = NodeStream.fromReadable(
            () => child.stdout,
            (cause) => new Cause.UnknownException(cause)
          )
          return [
            Stream.tapSink(stdout, upload),
            Stream.tapSink(download, stdin),
          ]
        }),
        Stream.runDrain,
        { concurrency: 'unbounded' }
      )
    )
  )
  .pipe(Effect.provide(NodeFileSystem.layer), Effect.runPromise)
`,
      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            allowSyntheticDefaultImports: true,
            exactOptionalPropertyTypes: true,
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            target: 'esnext',
            types: ['node'],
          },
          include: ['src'],
        },
        null,
        2
      ),
      'package.json': JSON.stringify(
        {
          name: 'ffmpeg-stream',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'pnpx tsx src/main.ts',
          },
          dependencies: {
            '@effect/platform': '^0.92.1',
            '@effect/platform-node': '^0.98.4',
            effect: '^3.18.4',
          },
          devDependencies: {
            '@types/node': '^24.9.2',
            typescript: '^5.9.3',
          },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'vanilla-js',
    name: 'Vanilla JavaScript',
    description: 'Vanilla JavaScript counter app',
    files: {
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
            vite: '^7.1.12',
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
  {
    id: 'react-todo-ts',
    name: 'React Todo App (TypeScript)',
    description: 'Interactive todo list built with React, TypeScript, and Vite',
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
          name: 'react-todo-ts',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          dependencies: {
            react: '^19.2.0',
            'react-dom': '^19.2.0',
          },
          devDependencies: {
            '@types/react': '^19.2.2',
            '@types/react-dom': '^19.2.2',
            '@vitejs/plugin-react': '^5.1.0',
            typescript: '^5.9.3',
            vite: '^7.1.12',
          },
        },
        null,
        2
      ),

      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            target: 'ESNext',
            useDefineForClassFields: true,
            lib: ['DOM', 'DOM.Iterable', 'ESNext'],
            allowJs: false,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            module: 'ESNext',
            moduleResolution: 'Node',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
          },
          include: ['src'],
        },
        null,
        2
      ),

      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Todo App (TS)</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,

      'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,

      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

      'src/App.tsx': `import { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setTodos([...todos, { id: Date.now(), text: trimmed, done: false }]);
      setInput('');
      console.log('Todo added:', trimmed);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const deleteTodo = (id: number) => {
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
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
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
    id: 'effect-atom',
    name: 'Effect Atoms React',
    description: 'Composing state with Effect Atoms',
    files: {
      'index.html':
        '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>React Todo App (TS)</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n',
      'package.json':
        '{\n  "name": "effect-atom",\n  "version": "1.0.0",\n  "type": "module",\n  "displayName": "Effect Atoms React",\n  "description": "Composing state with Effect Atoms",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "@effect-atom/atom-react": "^0.3.4",\n    "effect": "^3.18.4",\n    "react": "^19.2.0",\n    "react-dom": "^19.2.0"\n  },\n  "devDependencies": {\n    "@types/react": "^19.2.2",\n    "@types/react-dom": "^19.2.2",\n    "@vitejs/plugin-react": "^5.1.0",\n    "typescript": "^5.9.3",\n    "vite": "^7.1.12"\n  }\n}\n',
      'vite.config.ts':
        "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n",
      'src/App.tsx':
        "import { Fragment } from 'react'\nimport { Counter } from './components/Counter'\nimport { Users, UserCarousel } from './components/Users'\nimport { ScrollY } from './components/Scroll'\n\nexport default function App() {\n  return (\n    <Fragment>\n      <Counter />\n      <Users />\n      <ScrollY />\n      <UserCarousel />\n    </Fragment>\n  )\n}\n",
      'src/main.tsx':
        "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\nimport './style.css'\n\nReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n)\n",
      'src/atoms/counter.ts':
        "import { Atom, Result } from '@effect-atom/atom-react'\nimport { Effect, Schedule, Stream } from 'effect'\n\nexport const countAtom = Atom.make(0)\n\nexport const doubleCountAtom = Atom.map(countAtom, (count) => count * 2)\n\nexport const tripleCountAtom: Atom.Atom<Result.Result<number>> = Atom.make(\n  Effect.fn(function* (get) {\n    const count = get(countAtom)\n    yield* Effect.sleep(50)\n    return count * 3\n  })\n)\n\nexport const combinedCountAtom: Atom.Atom<Result.Result<number>> = Atom.make(\n  Effect.fn(function* (get) {\n    const count = get(countAtom)\n    const double = get(doubleCountAtom)\n    const triple = yield* get.result(tripleCountAtom)\n    return count + double + triple\n  })\n)\n\nexport const liveCounterAtom: Atom.Atom<Result.Result<number>> = Atom.make(\n  Stream.fromSchedule(Schedule.spaced(1000))\n)\n",
      'src/atoms/scroll.ts':
        "import { Atom } from '@effect-atom/atom-react'\n\nexport const scrollYAtom = Atom.make((get) => {\n  const onScroll = () => get.setSelf(window.scrollY)\n  window.addEventListener('scroll', onScroll)\n  get.addFinalizer(() => window.removeEventListener('scroll', onScroll))\n  return window.scrollY\n})\n",
      'src/atoms/users.ts':
        "import { Atom, Result } from '@effect-atom/atom-react'\nimport { Effect } from 'effect'\n\nconst users = [\n  { id: '1', name: 'Alice' },\n  { id: '2', name: 'Bob' },\n  { id: '3', name: 'Charlie' },\n]\n\nexport class Users extends Effect.Service<Users>()('app/Users', {\n  effect: Effect.gen(function* () {\n    const addUser = (name: string) => {\n      const newUser = { id: new Date().toTimeString(), name }\n      users.push(newUser)\n      return Effect.succeed(newUser)\n    }\n\n    const findById = (id: string) => {\n      return Effect.fromNullable(users.filter((u) => u.id === id)[0])\n    }\n\n    const getAll = Effect.succeed(users)\n\n    return { addUser, findById, getAll }\n  }),\n}) {}\n\nconst runtime = Atom.runtime(Users.Default)\n\nexport const addUserAtom = Atom.family((name: string) =>\n  runtime.atom(\n    Effect.fn(function* () {\n      const users = yield* Users\n      const newUser = yield* users.addUser(name)\n      return newUser\n    })\n  )\n)\n\nexport const findUserByIdAtom = Atom.family((id: string) =>\n  runtime.atom(\n    Effect.gen(function* () {\n      const users = yield* Users\n      return yield* users.findById(id)\n    })\n  )\n)\n\nexport const usersAtom: Atom.Atom<\n  Result.Result<{ id: string; name: string }[]>\n> = runtime.atom(\n  Effect.gen(function* () {\n    const users = yield* Users\n    return yield* users.getAll\n  })\n)\n",
      'src/components/Counter.tsx':
        "import { useAtom, useAtomValue, Result } from '@effect-atom/atom-react'\nimport {\n  countAtom,\n  doubleCountAtom,\n  combinedCountAtom,\n  liveCounterAtom,\n} from '../atoms/counter'\n\nexport function Counter() {\n  const [count, setCount] = useAtom(countAtom)\n  const double = useAtomValue(doubleCountAtom)\n  const combined = useAtomValue(combinedCountAtom)\n  const live = useAtomValue(liveCounterAtom)\n\n  return (\n    <div>\n      <h2>Count: {count}</h2>\n      <h3>Double: {double}</h3>\n      <h3>\n        Sum (count + double + triple): {Result.getOrElse(combined, () => 0)}\n      </h3>\n      <h3>Live stream tick: {Result.getOrElse(live, () => 0)}</h3>\n      <button onClick={() => setCount((c) => c + 1)}>+</button>\n      <button onClick={() => setCount((c) => c - 1)}>-</button>\n    </div>\n  )\n}\n",
      'src/components/Users.tsx':
        "import { useAtomValue, Result, Atom } from '@effect-atom/atom-react'\nimport { Cause, Option, Schedule, Stream } from 'effect'\nimport { findUserByIdAtom, usersAtom } from '../atoms/users'\n\nexport function Users() {\n  const users = useAtomValue(usersAtom)\n  // const result = Result.getOrElse(users, () => [])\n  // const result = Result.value(users).pipe(Option.getOrNull)\n\n  return (\n    <div>\n      <h2>Users</h2>\n      {Result.match(users, {\n        onInitial: () => <p>Loading...</p>,\n        onFailure: (error) => <p>Error: {Cause.pretty(error.cause)}</p>,\n        onSuccess: (res) => res.value.map((u) => <p key={u.id}>{u.name}</p>),\n      })}\n    </div>\n  )\n}\n\nexport function UserProfile({ id }: { id: string }) {\n  const user = useAtomValue(findUserByIdAtom(id))\n  const result = Result.value(user).pipe(Option.getOrNull)\n  return (\n    <h4>\n      User {result?.id}: {result?.name}\n    </h4>\n  )\n}\n\nexport function UserCarousel() {\n  const loopId = Atom.make(\n    Stream.fromSchedule(Schedule.spaced(1000)).pipe(\n      Stream.scan(1, (prev) => (prev % 3) + 1)\n    )\n  )\n  return (\n    <UserProfile\n      id={Result.getOrElse(useAtomValue(loopId), () => '1').toString()}\n    />\n  )\n}\n",
      'src/components/Scroll.tsx':
        "import { useAtomValue } from '@effect-atom/atom-react'\nimport { scrollYAtom } from '../atoms/scroll'\n\nexport function ScrollY() {\n  const y = useAtomValue(scrollYAtom)\n  return <h4>ScrollY: {y.toFixed(0)}</h4>\n}\n",
      'src/style.css':
        '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family:\n    system-ui,\n    -apple-system,\n    sans-serif;\n  background: black;\n  color: white;\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2rem;\n}\n\nbutton {\n  background: transparent;\n  margin-right: 1rem;\n  color: #cbff10;\n  border: none;\n  font-size: 1rem;\n  font-weight: bold;\n}\n\nbutton:hover {\n  opacity: 70%;\n  cursor: pointer;\n}\n\nul {\n  opacity: 50%;\n}\n',
    },
  },
]
