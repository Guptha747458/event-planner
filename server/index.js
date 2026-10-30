import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigin = process.env.CLIENT_ORIGIN || true;

// Middlewares
app.use(cors({ origin: allowedOrigin }));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here')
  });
});

// API Routes
app.use('/api', apiRoutes);

// In production, serve the Vite static build
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all middleware to serve SPA for client routes
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Vite build not found. Run dev server or "npm run build".');
    }
  });
});

// Start listening if executed directly as entrypoint
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === __filename || process.argv[1].endsWith('server/index.js'));
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`[Event Planner Server] Running at http://localhost:${PORT}`);
    console.log(`[Gemini Integration] API Key status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'UNCONFIGURED (using fallback)'}`);
    console.log(`[Gemini Integration] Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[Event Planner Server] Received ${signal}. Shutting down cleanly...`);
    if (server) {
      server.closeAllConnections?.();
      server.close(() => {
        console.log('[Event Planner Server] Server stopped.');
        process.exit(0);
      });
      // Force exit after 1.5 seconds if handles remain
      setTimeout(() => process.exit(0), 1500).unref();
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

export default app;
