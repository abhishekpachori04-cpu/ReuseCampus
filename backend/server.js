// 1. Load environment variables before ANY other imports (ES module standard)
import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure .env inside the backend directory is found regardless of where npm/node was initiated
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Application imports
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

/**
 * Environment Variable Verification Check
 */
const verifyEnvironment = () => {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[Warning] Missing critical environment variables: ${missing.join(', ')}.`
    );
    console.warn(
      'Make sure to create a .env file inside backend directory based on .env.example.'
    );
  } else {
    console.log('[Environment] Critical environment variables loaded successfully.');
  }
};

verifyEnvironment();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.log('[Database] MONGO_URI not set yet. Skipping initial MongoDB connection.');
}

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local dev
    },
    credentials: true,
  })
);

// Body Parsing Middlewares (increased limit to 10mb for student device photo uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ReuseCampus API',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server (only if not imported by test suites)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ReuseCampus Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
