import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login } from './controllers/authController';
import { createLinkToken, exchangePublicToken } from './controllers/plaidController';
import { requireAuth } from './middleware/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors()); // 允許你的 Next.js 前端打 API
app.use(express.json());

// Routes: Auth (不需登入)
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Routes: Plaid (需要登入 JWT Token)
app.post('/api/plaid/create-link-token', requireAuth, createLinkToken);
app.post('/api/plaid/exchange-public-token', requireAuth, exchangePublicToken);

// 啟動 Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Kura Backend running on http://localhost:${PORT}`);
});