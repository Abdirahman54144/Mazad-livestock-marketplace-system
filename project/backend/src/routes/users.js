import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/users — list all users (excludes password)
router.get('/', (_req, res) => {
  const users = db.prepare(
    'SELECT id, email, full_name, role, location, phone, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

// GET /api/users/:id — single user
router.get('/:id', (req, res) => {
  const user = db.prepare(
    'SELECT id, email, full_name, role, location, phone, created_at FROM users WHERE id = ?'
  ).get(req.params.id);

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST /api/users — create a new user
router.post('/', (req, res) => {
  const { email, password, full_name, role, location, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = db.prepare(
      `INSERT INTO users (email, password, full_name, role, location, phone)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(email, password, full_name || '', role || 'buyer', location || null, phone || null);

    const user = db.prepare(
      'SELECT id, email, full_name, role, location, phone, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id — update a user
router.put('/:id', (req, res) => {
  const { full_name, role, location, phone } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'User not found' });

  db.prepare(
    `UPDATE users
     SET full_name = COALESCE(?, full_name),
         role      = COALESCE(?, role),
         location  = COALESCE(?, location),
         phone     = COALESCE(?, phone),
         updated_at = datetime('now')
     WHERE id = ?`
  ).run(full_name, role, location, phone, req.params.id);

  const user = db.prepare(
    'SELECT id, email, full_name, role, location, phone, created_at FROM users WHERE id = ?'
  ).get(req.params.id);

  res.json(user);
});

// DELETE /api/users/:id — delete a user
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
});

export default router;
