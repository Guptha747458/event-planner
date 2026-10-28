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

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
  app.listen(PORT, () => {
    console.log(`[Event Planner Server] Running at http://localhost:${PORT}`);
    console.log(`[Gemini Integration] API Key status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'UNCONFIGURED (using fallback)'}`);
    console.log(`[Gemini Integration] Model: ${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'}`);
  });
}

export default app;
