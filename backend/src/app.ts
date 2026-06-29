import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.routes';
import catalogRouter from './routes/catalog.routes';
import checkoutRouter from './routes/checkout.routes';
import brandRouter from './routes/brand.routes';
import blogRouter from './routes/blog.routes';
import newsletterRouter from './routes/newsletter.routes';
import contactRouter from './routes/contact.routes';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();

// Security HTTP headers
app.use(helmet());

// Rate Limiting for Authentication Endpoints (security hardening against brute-force attacks)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP address to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable legacy X-RateLimit headers
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers - Limit payload size for base routes, keeping webhook routes parsed as raw buffers
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/v1/checkout/webhooks/stripe' || req.originalUrl === '/api/v1/checkout/webhooks/razorpay') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Luxury Jewelry Platform API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/v1/auth', authRateLimiter, authRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/checkout', checkoutRouter);
app.use('/api/v1/brands', brandRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/newsletter', newsletterRouter);
app.use('/api/v1/contact', contactRouter);

// Fallback route 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
