import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './server/routes/auth.js';
import jobsRoutes from './server/routes/jobs.js';
import resumesRoutes from './server/routes/resumes.js';
import aiRoutes from './server/routes/ai.js';
import coverLettersRoutes from './server/routes/coverLetters.js';
import interviewsRoutes from './server/routes/interviews.js';
import analyticsRoutes from './server/routes/analytics.js';
import systemRoutes from './server/routes/system.js';
import documentsRoutes from './server/routes/documents.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[REST] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// REST API Routers
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/resumes', resumesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cover-letters', coverLettersRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/documents', documentsRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', service: 'JobHub Pro API', timestamp: new Date().toISOString() });
});

// Explicit API 404 handler - prevents any unmatched /api/* call from falling through to Vite HTML fallback
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    path: req.originalUrl,
  });
});

// Frontend Integration (Vite in Dev, Dist in Prod)
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Spring Boot-style Error Handling Middleware (mounted after all middlewares)
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[CentralizedExceptionHandler]', err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      error: status === 404 ? 'Not Found' : status === 400 ? 'Bad Request' : 'Internal Server Error',
      message: err.message || 'An unexpected error occurred during request processing',
      path: req.originalUrl,
      validationErrors: err.validationErrors || undefined,
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JobHub Pro Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 Spring Boot REST API Specification active on /api/*`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
