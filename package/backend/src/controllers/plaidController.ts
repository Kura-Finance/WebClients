import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { plaidClient } from '../lib/plaid';
import { prisma } from '../lib/prisma';
import { CountryCode, Products } from 'plaid';

// 1. 產生一次性 Link Token 給前端
export const createLinkToken = async (req: AuthRequest, res: Response) => {
  try {
    const request: any = {
      user: { client_user_id: req.userId! },
      client_name: 'Kura Finance',
      products: [Products.Transactions, Products.Investments],
      country_codes: [CountryCode.Us, CountryCode.Gb, CountryCode.Fr, CountryCode.De],
      language: 'en',
    };

    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI; // 歐盟 Oauth 需要
    }

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: '無法產生 Plaid Link Token' });
  }
};

// 2. 前端授權成功後，拿 Public Token 來換取永久 Access Token
export const exchangePublicToken = async (req: AuthRequest, res: Response) => {
  try {
    const { public_token, institution_name } = req.body;
    const userId = req.userId!;

    // 向 Plaid 交換永久 Token
    const response = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // 將永久 Token 存入資料庫，並與該使用者綁定
    await prisma.plaidItem.create({
      data: {
        userId,
        accessToken,
        itemId,
        institutionName: institution_name || 'Unknown Bank',
      },
    });

    res.json({ status: 'success', message: '銀行帳戶已成功連結' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Token 交換失敗' });
  }
};