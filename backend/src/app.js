const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const reportRoutes = require('./routes/reports.routes');
const publicRoutes = require('./routes/public.routes');
const governmentRoutes = require('./routes/government.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
}));
app.use(express.json());
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')),
);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' }));

app.use(errorHandler);

module.exports = app;
