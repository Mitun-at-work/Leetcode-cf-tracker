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
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

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
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  // Server started successfully
});

export default app;