import express from 'express';
import { setLang, t } from './node_modules/langmodule/src/lang.mjs';
import todoRoutes from './routes/todo.mjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use('/node_modules', express.static('node_modules'));

app.use(express.json());
app.use('/api/todo', todoRoutes);

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

//tester om github funker på ny pc

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});