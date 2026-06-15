import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

const app = express();

// Enable CORS for development origins (MUST be before security/rate limiter to prevent Network Errors on errors)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5176',
  'http://127.0.0.1:5176',
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  process.env.CORS_ORIGIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Security HTTP headers
app.use(helmet());

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Rate limiting — relaxed in development, strict in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production',
  message: { status: 'error', message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Parsing JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FinBridge API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Authentication routes mounting
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);

// Financial profile routes mounting
import financialProfileRoutes from './routes/financialProfileRoutes.js';
app.use('/api/financial-profile', financialProfileRoutes);

// Loans routes mounting
import loanRoutes from './routes/loanRoutes.js';
app.use('/api/loans', loanRoutes);

// Investments routes mounting
import investmentRoutes from './routes/investmentRoutes.js';
app.use('/api/investments', investmentRoutes);

// Loan Products routes mounting (recommendations + admin CRUD + analytics)
import loanProductRoutes from './routes/loanProductRoutes.js';
app.use('/api/loan-products', loanProductRoutes);

// Case Notes routes mounting (consultant only)
import caseNoteRoutes from './routes/caseNoteRoutes.js';
app.use('/api/case-notes', caseNoteRoutes);

// Schedule / email reminder routes (consultant only)
import scheduleRoutes from './routes/scheduleRoutes.js';
app.use('/api/schedule', scheduleRoutes);

// Recommendations / advisory desk routes (consultant only)
import recommendationRoutes from './routes/recommendationRoutes.js';
app.use('/api/recommendations', recommendationRoutes);

// Consultation booking + acceptance flow (client + consultant)
import consultationRoutes from './routes/consultationRoutes.js';
app.use('/api/consultations', consultationRoutes);

// Notification routes (client + consultant)
import notificationRoutes from './routes/notificationRoutes.js';
app.use('/api/notifications', notificationRoutes);

// Lead management routes (CRM / admin)
import leadRoutes from './routes/leadRoutes.js';
app.use('/api/leads', leadRoutes);

// Proposal routes (consultant + client)
import proposalRoutes from './routes/proposalRoutes.js';
app.use('/api/proposals', proposalRoutes);

// Document routes
import documentRoutes from './routes/documentRoutes.js';
app.use('/api/documents', documentRoutes);

// Loan Case workflow routes (consultant)
import loanCaseRoutes from './routes/loanCaseRoutes.js';
app.use('/api/loan-cases', loanCaseRoutes);

// Department-specific case workflow routes (tax/investment/insurance/wealth)
import deptCaseRoutes from './routes/deptCaseRoutes.js';
app.use('/api/dept-cases', deptCaseRoutes);

// Invoice routes (consultant creates, client views)
import invoiceRoutes from './routes/invoiceRoutes.js';
app.use('/api/invoices', invoiceRoutes);

// Payment gateway routes (Razorpay integration + webhook)
import paymentRoutes from './routes/paymentRoutes.js';
app.use('/api/payments', paymentRoutes);

// Custom 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Centralized Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
