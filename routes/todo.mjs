import express from 'express';
const router = express.Router();
import pool from '../db/index.mjs';
import { authenticateSession } from '../routes/auth.mjs';

router.get('/', authenticateSession, async (req, res) => {
  const username = req.query.username;
  try {
    const { rows } = await pool.query('SELECT todos.* FROM todos JOIN users ON todos.user_id = users.id WHERE users.username = $1', [username]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching todos' });
  }
});

router.post('/', authenticateSession, async (req, res) => {
  try {
    const { title } = req.body;
    //const userId = req.session.user.id;
    const { rows } = await pool.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while creating a todo' });
  }
});

router.put('/:id', authenticateSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    const { rows } = await pool.query('UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *', [title, completed, id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating the todo' });
  }
});

router.delete('/:id', authenticateSession, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while deleting the todo' });
  }
});

export default router;
