import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import resourceRoutes from './routes/resourceRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import pgbotRoutes from './routes/pgbotRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');

const app = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible UI assets and Google Fonts
  })
);
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS === '*' ? true : env.ALLOWED_ORIGINS.split(','),
    credentials: true,
  })
);
app.use(express.json());

// Serve static frontend assets
app.use(express.static(publicDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/resources', resourceRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/pgbot', pgbotRoutes);

// Radio Terminal TUI Route
app.get('/radio', (req, res) => {
  res.sendFile(path.join(publicDir, 'radio.html'));
});

// Frontend SPA fallback for subroutes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Error handler
app.use(errorHandler);

export default app;
