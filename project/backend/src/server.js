import express from 'express';
import cors from 'cors';
import { ensureSchema } from './db.js';
import usersRouter from './routes/users.js';
import listingsRouter from './routes/listings.js';
import ordersRouter from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
ensureSchema();

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Mazad API is running' });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/orders', ordersRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Mazad backend running on http://localhost:${PORT}`);
});

export default app;
