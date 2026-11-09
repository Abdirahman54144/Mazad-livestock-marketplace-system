import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/listings — list all listings (optional filters: type, status, seller_id)
router.get('/', (req, res) => {
  const { type, status, seller_id } = req.query;
  let query = 'SELECT * FROM listings WHERE 1=1';
  const params = [];

  if (type) { query += ' AND type = ?'; params.push(type); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (seller_id) { query += ' AND seller_id = ?'; params.push(seller_id); }

  query += ' ORDER BY created_at DESC';
  const listings = db.prepare(query).all(...params);
  res.json(listings);
});

// GET /api/listings/:id — single listing with seller info
router.get('/:id', (req, res) => {
  const listing = db.prepare(
    `SELECT l.*, u.full_name AS seller_name, u.email AS seller_email, u.phone AS seller_phone
     FROM listings l
     JOIN users u ON l.seller_id = u.id
     WHERE l.id = ?`
  ).get(req.params.id);

  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  res.json(listing);
});

// POST /api/listings — create a new listing
router.post('/', (req, res) => {
  const { seller_id, title, type, price, location, description, image_url } = req.body;

  if (!seller_id || !title || !type || price == null || !location) {
    return res.status(400).json({ error: 'seller_id, title, type, price, and location are required' });
  }

  try {
    const result = db.prepare(
      `INSERT INTO listings (seller_id, title, type, price, location, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(seller_id, title, type, price, location, description || '', image_url || null);

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(listing);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Seller not found' });
    }
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// PUT /api/listings/:id — update a listing
router.put('/:id', (req, res) => {
  const { title, type, price, location, description, image_url, status } = req.body;
  const existing = db.prepare('SELECT id FROM listings WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Listing not found' });

  db.prepare(
    `UPDATE listings
     SET title       = COALESCE(?, title),
         type        = COALESCE(?, type),
         price       = COALESCE(?, price),
         location    = COALESCE(?, location),
         description = COALESCE(?, description),
         image_url   = COALESCE(?, image_url),
         status      = COALESCE(?, status),
         updated_at  = datetime('now')
     WHERE id = ?`
  ).run(title, type, price, location, description, image_url, status, req.params.id);

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  res.json(listing);
});

// DELETE /api/listings/:id — delete a listing
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Listing not found' });
  res.status(204).send();
});

export default router;
