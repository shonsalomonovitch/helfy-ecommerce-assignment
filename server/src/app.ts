import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app: Application = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);


app.use(express.json());

// API routes
app.use('/api', routes);

// Centralized error handling middleware (must be last)
app.use(errorHandler);

export default app;
