import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import resourceRoutes from './routes/resource.routes.js';
import buildingRoutes from './routes/building.routes.js';
import authRoutes from './routes/auth.routes.js';
import predictionRoutes from './routes/prediction.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import reportRoutes from './routes/report.routes.js';
import alertRoutes from './routes/alert.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use("/uploads", express.static("uploads"));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/resources',   resourceRoutes);
app.use('/api/buildings',   buildingRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/assistant',   assistantRoutes);
app.use('/api/reports',     reportRoutes);
app.use('/api/alerts',      alertRoutes);
app.use('/api',             gamificationRoutes);
app.use('/api/admin',        adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Database + Start ──────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greencampus')
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  GreenCampus API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
