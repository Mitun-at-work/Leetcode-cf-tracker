import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses larger than 1KB
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for code execution
const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 executions per minute
  message: 'Too many code executions, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/execute-cpp', executionLimiter);

// C++ Executor service URL
const CPP_EXECUTOR_URL = process.env.CPP_EXECUTOR_URL || 'http://localhost:8081';

// Routes
app.post('/api/execute-cpp', async (req, res) => {
  try {
    const { code, input = '' } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Validate code length
    if (code.length > 100000) {
      return res.status(400).json({ error: 'Code too long (max 10000 characters)' });
    }

    // Validate input length
    if (input.length > 10000) {
      return res.status(400).json({ error: 'Input too long (max 10000 characters)' });
    }

    // Call C++ executor service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${CPP_EXECUTOR_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, input }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`C++ executor service returned ${response.status}`);
      }

      const result = await response.json();
      res.json(result);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timed out' });
      }
      
      // Check if it's a connection error (service not available)
      if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))) {
        return res.status(503).json({ 
          error: 'C++ execution service is not available', 
          details: 'The code execution service is currently offline. Please try again later or contact support.' 
        });
      }
      
      throw error;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Failed to execute code',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
  return;
});

// Health check with caching
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// C++ executor health check
app.get('/health/cpp-executor', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${CPP_EXECUTOR_URL}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      res.json({ status: 'OK', service: 'cpp-executor' });
    } else {
      res.status(503).json({ status: 'ERROR', service: 'cpp-executor', details: 'Service responded with error' });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      service: 'cpp-executor', 
      details: 'Service not available',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  // Server started successfully
});

export default app;