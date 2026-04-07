import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { register, login, me, updateProfile } from './controllers/authController';
import {
  createLinkToken,
  exchangePublicToken,
  getFinanceSnapshot,
  disconnectPlaidAccount,
  updatePlaidAccountOrder,
} from './controllers/plaidController';
import { requireAuth } from './middleware/auth';
import { appLogger } from './lib/logger';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envResult = dotenv.config({ path: envFile });
if (envResult.error) {
  dotenv.config();
}

const app = express();
const defaultFrontendOrigin =
  process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'https://localhost:3000';
const fallbackOrigins = Array.from(
  new Set([
    defaultFrontendOrigin,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://localhost:3000',
    'https://127.0.0.1:3000',
    'https://localhost:3001',
    'https://127.0.0.1:3001',
  ])
);

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || fallbackOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes: Auth (不需登入)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Routes: Auth profile (需要登入 JWT Token)
app.get('/api/auth/me', requireAuth, me);
app.patch('/api/auth/me', requireAuth, updateProfile);

// Routes: Plaid (需要登入 JWT Token)
app.post('/api/plaid/create-link-token', requireAuth, createLinkToken);
app.post('/api/plaid/exchange-public-token', requireAuth, exchangePublicToken);
app.get('/api/plaid/finance-snapshot', requireAuth, getFinanceSnapshot);
app.post('/api/plaid/account-order', requireAuth, updatePlaidAccountOrder);
app.delete('/api/plaid/account', requireAuth, disconnectPlaidAccount);

// 啟動 Server
const PORT = Number(process.env.PORT || 8080);
const defaultCertPath = path.resolve(process.cwd(), '../certificates/localhost.pem');
const defaultKeyPath = path.resolve(process.cwd(), '../certificates/localhost-key.pem');
const certPath = process.env.SSL_CERT_PATH
  ? path.resolve(process.cwd(), process.env.SSL_CERT_PATH)
  : defaultCertPath;
const keyPath = process.env.SSL_KEY_PATH
  ? path.resolve(process.cwd(), process.env.SSL_KEY_PATH)
  : defaultKeyPath;
const shouldUseHttps = (process.env.BACKEND_USE_HTTPS || '').toLowerCase() === 'true';

if (shouldUseHttps) {
  try {
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);

    https.createServer({ key, cert }, app).listen(PORT, () => {
      appLogger.info(`Kura Backend running on https://localhost:${PORT}`);
    });
  } catch (error) {
    appLogger.warn('HTTPS cert/key not found, falling back to HTTP', {
      certPath,
      keyPath,
      error: error instanceof Error ? error.message : error,
    });

    app.listen(PORT, () => {
      appLogger.info(`Kura Backend running on http://localhost:${PORT}`);
    });
  }
} else {
  app.listen(PORT, () => {
    appLogger.info(`Kura Backend running on http://localhost:${PORT}`);
  });
}