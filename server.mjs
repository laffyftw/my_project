import express from 'express';
import { setLang, t } from './node_modules/langmodule/src/lang.mjs';
import todoRoutes from './routes/todo.mjs';

const app = express();
const port = process.env.PORT || 8080;

const users = new Map();
const sessions = new Map();

app.use('/node_modules', express.static('node_modules'));

app.use(express.json());
app.use('/api/todo', todoRoutes);

// Removed duplicate app.use
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    req.session = sessions.get(sessionId);
  } else {
    const newSessionId = Date.now().toString();
    req.session = {};
    sessions.set(newSessionId, req.session);
    res.setHeader('x-session-id', newSessionId);
  }
  next();
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  if (users.has(username)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Save the user
  users.set(username, { password });
  res.status(201).json({ message: 'User registered successfully' });
});

// Removed duplicate /login route handler
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user
  const user = users.get(username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Set the session user
  req.session.user = user;
  res.json({ message: 'Logged in successfully', user });
});

const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

app.get('/protected', authenticateSession, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
