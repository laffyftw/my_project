import express from 'express';
const router = express.Router();
import pool from '../db/index.mjs';
import { sessions } from '../server.mjs';

//Adding simple hash function
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hash = (hash << 5) - hash + charCode;
      hash |= 0;
    }
    return hash.toString();
  }


router.use((req, res, next) => {
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
  

  router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = simpleHash(password);
  
    try {
      const { rows } = await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *', [username, passwordHash]);
      res.status(201).json({ message: 'User registered successfully', user: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while registering' });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = simpleHash(password);
  
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  
      if (rows.length === 0 || rows[0].password_hash !== passwordHash) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // Set the session user
      req.session.user = rows[0];
      res.json({ message: 'Logged in successfully', user: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while logging in' });
    }
  });

  const authenticateSession = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    next();
  };


router.get('/protected', authenticateSession, (req, res) => {
    res.json({ message: 'This is a protected route' });
  });
  

  export { router as default, authenticateSession };
