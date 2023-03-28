import express from 'express';
import { setLang, t } from './node_modules/langmodule/src/lang.mjs';
import todoRoutes from './routes/todo.mjs';
import authRoutes from './routes/auth.mjs';

const app = express();
const port = process.env.PORT || 8080;

const sessions = new Map();

app.use('/node_modules', express.static('node_modules'));
app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use('/api/todo', todoRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export { sessions };