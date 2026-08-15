import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import resourceRoutes from './routes/resourceRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(express.json());

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

// Error handler
app.use(errorHandler);

export default app;
