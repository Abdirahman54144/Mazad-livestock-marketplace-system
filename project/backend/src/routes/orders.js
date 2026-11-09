import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/orders — list all orders (optional filter: status, buyer_id, seller_id)
router.get('/', (req, res) => {
  const { status, buyer_id, seller_id } = req.query;
  let query = `
    SELECT o.*, l.title AS listing_title, l.type AS listing_type,
           b.full_name AS buyer_name, s.full_name AS seller_name
    FROM orders o
    JOIN listings l ON o.listing_id = l.id
    JOIN users b ON o.buyer_id = b.id
    JOIN users s ON o.seller_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND o.status = ?'; params.push(status); }
  if (buyer_id) { query += ' AND o.buyer_id = ?'; params.push(buyer_id); }
  if (seller_id) { query += ' AND o.seller_id = ?'; params.push(seller_id); }

  query += ' ORDER BY o.created_at DESC';
  const orders = db.prepare(query).all(...params);
  res.json(orders);
});

// GET /api/orders/:id — single order
router.get('/:id', (req, res) => {
  const order = db.prepare(
    `SELECT o.*, l.title AS listing_title, l.type AS listing_type,
            b.full_name AS buyer_name, s.full_name AS seller_name
     FROM orders o
     JOIN listings l ON o.listing_id = l.id
     JOIN users b ON o.buyer_id = b.id
     JOIN users s ON o.seller_id = s.id
     WHERE o.id = ?`
  ).get(req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// POST /api/orders — create a new order
router.post('/', (req, res) => {
  const { listing_id, buyer_id, quantity, notes } = req.body;

  if (!listing_id || !buyer_id) {
    return res.status(400).json({ error: 'listing_id and buyer_id are required' });
  }

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status === 'sold') return res.status(400).json({ error: 'Listing already sold' });

  const qty = quantity || 1;
  const totalPrice = Number(listing.price) * qty;

  try {
    const result = db.prepare(
      `INSERT INTO orders (listing_id, buyer_id, seller_id, quantity, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`
    ).run(listing_id, buyer_id, listing.seller_id, qty, totalPrice, notes || null);

    const order = db.prepare(
      `SELECT o.*, l.title AS listing_title, l.type AS listing_type,
              b.full_name AS buyer_name, s.full_name AS seller_name
       FROM orders o
       JOIN listings l ON o.listing_id = l.id
       JOIN users b ON o.buyer_id = b.id
       JOIN users s ON o.seller_id = s.id
       WHERE o.id = ?`
    ).get(result.lastInsertRowid);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id — update order status
router.put('/:id', (req, res) => {
  const { status } = req.body;
  const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Order not found' });

  db.prepare(
    `UPDATE orders SET status = COALESCE(?, status) WHERE id = ?`
  ).run(status, req.params.id);

  const order = db.prepare(
    `SELECT o.*, l.title AS listing_title, l.type AS listing_type,
            b.full_name AS buyer_name, s.full_name AS seller_name
     FROM orders o
     JOIN listings l ON o.listing_id = l.id
     JOIN users b ON o.buyer_id = b.id
     JOIN users s ON o.seller_id = s.id
     WHERE o.id = ?`
  ).get(req.params.id);

  res.json(order);
});

// DELETE /api/orders/:id — delete an order
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.status(204).send();
});

export default router;
