import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { plaidClient } from '../lib/plaid';
import { prisma } from '../lib/prisma';
import { CountryCode, Products } from 'plaid';
import { appLogger } from '../lib/logger';

type BankingAccountType = 'checking' | 'saving' | 'credit' | 'crypto';
type TransactionType = 'credit' | 'deposit' | 'transfer';
type InvestmentAccountType = 'Broker' | 'Exchange' | 'Web3 Wallet';
type InvestmentType = 'crypto' | 'stock';
type PlaidAccountBucket = 'banking' | 'investment';

interface StoredAccountOrderPayload {
  accountIds?: string[];
  investmentAccountIds?: string[];
}

interface PlaidAccountPayload {
  id: string;
  name: string;
  balance: number;
  type: BankingAccountType;
  logo: string;
}

interface PlaidTransactionPayload {
  id: string;
  accountId: string;
  accountName: string;
  accountType: BankingAccountType;
  amount: string;
  date: string;
  merchant: string;
  category: string;
  type: TransactionType;
}

interface PlaidInvestmentAccountPayload {
  id: string;
  name: string;
  type: InvestmentAccountType;
  logo: string;
}

interface PlaidInvestmentPayload {
  id: string;
  accountId: string;
  symbol: string;
  name: string;
  holdings: number;
  currentPrice: number;
  change24h: number;
  type: InvestmentType;
  logo: string;
}

const PLAID_FALLBACK_LOGO = 'https://www.google.com/s2/favicons?domain=plaid.com&sz=128';

const mapPlaidAccountType = (type: string, subtype?: string | null): BankingAccountType => {
  const normalizedSubtype = (subtype || '').toLowerCase();
  if (type === 'credit') {
    return 'credit';
  }
  if (normalizedSubtype.includes('saving')) {
    return 'saving';
  }
  if (normalizedSubtype.includes('check')) {
    return 'checking';
  }
  return 'checking';
};

const mapPlaidTransactionType = (amount: number, category?: string | null): TransactionType => {
  const normalizedCategory = (category || '').toLowerCase();
  if (normalizedCategory.includes('transfer')) {
    return 'transfer';
  }
  return amount < 0 ? 'deposit' : 'credit';
};

const mapPlaidInvestmentType = (securityType?: string | null): InvestmentType => {
  const normalized = (securityType || '').toLowerCase();
  return normalized.includes('crypto') ? 'crypto' : 'stock';
};

const classifyPlaidAccountBucket = (type?: string | null, subtype?: string | null): PlaidAccountBucket => {
  const normalizedType = (type || '').toLowerCase();
  const normalizedSubtype = (subtype || '').toLowerCase();

  // Investment-only buckets requested by product rules.
  const investmentSubtypeHints = [
    'brokerage',
    'broker',
    'hsa',
    'ira',
    '401k',
    '401(a)',
    '401',
    '403b',
    '457',
    'retirement',
  ];

  if (normalizedType === 'investment') {
    return 'investment';
  }

  if (investmentSubtypeHints.some((hint) => normalizedSubtype.includes(hint))) {
    return 'investment';
  }

  // Checking/Savings and all Credit Card flavors remain in banking dashboard.
  return 'banking';
};

const normalizeStoredOrder = (ids?: string[]) => {
  if (!ids) {
    return [] as string[];
  }

  return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0)));
};

const orderItemsByStoredIds = <T extends { id: string }>(items: T[], orderedIds: string[]) => {
  if (orderedIds.length === 0) {
    return items;
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  const orderedItems = orderedIds
    .map((id) => itemById.get(id))
    .filter((item): item is T => Boolean(item));
  const orderedIdSet = new Set(orderedIds);
  const remainingItems = items.filter((item) => !orderedIdSet.has(item.id));

  return [...orderedItems, ...remainingItems];
};

export const updatePlaidAccountOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }

    const { accountIds, investmentAccountIds } = req.body as StoredAccountOrderPayload;

    if (accountIds === undefined && investmentAccountIds === undefined) {
      res.status(400).json({ error: 'accountIds or investmentAccountIds is required' });
      return;
    }

    const data: { bankingAccountOrder?: string[]; investmentAccountOrder?: string[] } = {};

    if (accountIds !== undefined) {
      data.bankingAccountOrder = normalizeStoredOrder(accountIds);
    }

    if (investmentAccountIds !== undefined) {
      data.investmentAccountOrder = normalizeStoredOrder(investmentAccountIds);
    }

    await prisma.user.update({
      where: { id: req.userId },
      data,
    });

    res.json({ status: 'success', message: 'Account order updated successfully.' });
  } catch (error: any) {
    appLogger.error('Update account order failed', {
      error: error.response?.data || error.message || error,
      userId: req.userId,
    });
    res.status(500).json({ error: '無法更新卡片排序' });
  }
};

// 1. 產生一次性 Link Token 給前端
export const createLinkToken = async (req: AuthRequest, res: Response) => {
  try {
    const defaultFrontendUrl =
      process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : 'https://localhost:3000';
    const plaidRedirectUri = process.env.PLAID_REDIRECT_URI || `${defaultFrontendUrl}/dashboard`;

    const request: any = {
      user: { client_user_id: req.userId! },
      client_name: 'Kura',
      products: [Products.Transactions],
      optional_products: [Products.Investments],
      country_codes: [CountryCode.Us, CountryCode.Gb, CountryCode.Fr, CountryCode.De],
      language: 'en',
    };

    request.redirect_uri = plaidRedirectUri;

    const response = await plaidClient.linkTokenCreate(request);
    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    appLogger.error('Create Plaid link token failed', {
      error: error.response?.data || error.message || error,
      userId: req.userId,
    });
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
    appLogger.error('Exchange Plaid public token failed', {
      error: error.response?.data || error.message || error,
      userId: req.userId,
    });
    res.status(500).json({ error: 'Token 交換失敗' });
  }
};

export const disconnectPlaidAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }

    const { accountId } = req.body as { accountId?: string };
    if (!accountId) {
      res.status(400).json({ error: 'accountId is required' });
      return;
    }

    const plaidItems = await prisma.plaidItem.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        accessToken: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let matchedPlaidItemId: string | null = null;

    for (const item of plaidItems) {
      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.accessToken,
        });

        const hasAccount = accountsResponse.data.accounts.some(
          (account) => account.account_id === accountId
        );

        if (hasAccount) {
          matchedPlaidItemId = item.id;
          break;
        }
      } catch (error: any) {
        appLogger.warn('Failed to inspect Plaid item during disconnect', {
          error: error.response?.data || error.message || error,
          userId: req.userId,
          plaidItemId: item.id,
        });
      }
    }

    if (!matchedPlaidItemId) {
      // Idempotent response: if data was already removed, treat as success.
      res.json({ status: 'success', message: 'Account already disconnected.' });
      return;
    }

    await prisma.plaidItem.delete({
      where: { id: matchedPlaidItemId },
    });

    res.json({ status: 'success', message: 'Account disconnected successfully.' });
  } catch (error: any) {
    appLogger.error('Disconnect Plaid account failed', {
      error: error.response?.data || error.message || error,
      userId: req.userId,
    });
    res.status(500).json({ error: '無法解除連結銀行帳戶' });
  }
};

export const getFinanceSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: '未登入' });
      return;
    }

    const plaidItems = await prisma.plaidItem.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        accessToken: true,
        institutionName: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const user = (await prisma.user.findUnique({
      where: { id: req.userId },
    })) as
      | {
          bankingAccountOrder?: string[] | null;
          investmentAccountOrder?: string[] | null;
        }
      | null;

    if (plaidItems.length === 0) {
      res.json({
        accounts: [] as PlaidAccountPayload[],
        transactions: [] as PlaidTransactionPayload[],
        investmentAccounts: [] as PlaidInvestmentAccountPayload[],
        investments: [] as PlaidInvestmentPayload[],
      });
      return;
    }

    const accounts: PlaidAccountPayload[] = [];
    const transactions: PlaidTransactionPayload[] = [];
    const investmentAccounts: PlaidInvestmentAccountPayload[] = [];
    const investments: PlaidInvestmentPayload[] = [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateString = startDate.toISOString().slice(0, 10);
    const endDateString = new Date().toISOString().slice(0, 10);

    for (const item of plaidItems) {
      let plaidAccountsById = new Map<string, { name: string; type: string; subtype?: string | null }>();
      const accountBucketById = new Map<string, PlaidAccountBucket>();

      try {
        const accountsResponse = await plaidClient.accountsGet({
          access_token: item.accessToken,
        });

        for (const account of accountsResponse.data.accounts) {
          const bucket = classifyPlaidAccountBucket(account.type, account.subtype);

          plaidAccountsById.set(account.account_id, {
            name: account.name,
            type: account.type,
            subtype: account.subtype,
          });
          accountBucketById.set(account.account_id, bucket);

          if (bucket === 'investment') {
            investmentAccounts.push({
              id: account.account_id,
              name: `${item.institutionName} · ${account.name}`,
              type: 'Broker',
              logo: PLAID_FALLBACK_LOGO,
            });
            continue;
          }

          accounts.push({
            id: account.account_id,
            name: `${item.institutionName} · ${account.name}`,
            balance: Number(account.balances.current || 0),
            type: mapPlaidAccountType(account.type, account.subtype),
            logo: PLAID_FALLBACK_LOGO,
          });
        }
      } catch (error: any) {
        appLogger.warn('Fetch Plaid accounts failed for item', {
          error: error.response?.data || error.message || error,
          plaidItemId: item.id,
          userId: req.userId,
        });
      }

      try {
        const txResponse = await plaidClient.transactionsGet({
          access_token: item.accessToken,
          start_date: startDateString,
          end_date: endDateString,
          options: { count: 100 },
        });

        for (const tx of txResponse.data.transactions) {
          if (accountBucketById.get(tx.account_id) === 'investment') {
            continue;
          }

          const accountMeta = plaidAccountsById.get(tx.account_id);
          const primaryCategory = tx.personal_finance_category?.primary || tx.category?.[0] || 'Uncategorized';

          transactions.push({
            id: tx.transaction_id,
            accountId: tx.account_id,
            accountName: accountMeta?.name || 'Plaid Account',
            accountType: mapPlaidAccountType(accountMeta?.type || 'depository', accountMeta?.subtype),
            amount: Number(Math.abs(tx.amount)).toFixed(2),
            date: tx.date,
            merchant: tx.merchant_name || tx.name,
            category: primaryCategory,
            type: mapPlaidTransactionType(tx.amount, primaryCategory),
          });

          if (!accountMeta) {
            plaidAccountsById.set(tx.account_id, {
              name: tx.account_owner || 'Plaid Account',
              type: 'depository',
              subtype: null,
            });
          }
        }
      } catch (error: any) {
        appLogger.warn('Fetch Plaid transactions failed for item', {
          error: error.response?.data || error.message || error,
          plaidItemId: item.id,
          userId: req.userId,
        });
      }

      try {
        const holdingsResponse = await plaidClient.investmentsHoldingsGet({
          access_token: item.accessToken,
        });

        const securitiesById = new Map(
          holdingsResponse.data.securities.map((security) => [security.security_id, security])
        );

        for (const account of holdingsResponse.data.accounts) {
          if (accountBucketById.get(account.account_id) === 'banking') {
            continue;
          }

          investmentAccounts.push({
            id: account.account_id,
            name: `${item.institutionName} · ${account.name}`,
            type: 'Broker',
            logo: PLAID_FALLBACK_LOGO,
          });
        }

        for (const holding of holdingsResponse.data.holdings) {
          const security = securitiesById.get(holding.security_id);
          if (!security) continue;

          investments.push({
            id: `${holding.account_id}-${holding.security_id}`,
            accountId: holding.account_id,
            symbol: security.ticker_symbol || security.name || 'N/A',
            name: security.name || security.ticker_symbol || 'Unknown Asset',
            holdings: Number(holding.quantity || 0),
            currentPrice: Number(holding.institution_price || 0),
            change24h: 0,
            type: mapPlaidInvestmentType(security.type),
            logo: PLAID_FALLBACK_LOGO,
          });
        }
      } catch (error: any) {
        appLogger.info('No investment holdings available for Plaid item', {
          error: error.response?.data || error.message || error,
          plaidItemId: item.id,
          userId: req.userId,
        });
      }
    }

    const dedupedAccounts = Array.from(new Map(accounts.map((acc) => [acc.id, acc])).values());
    const dedupedTransactions = Array.from(
      new Map(transactions.map((tx) => [String(tx.id), tx])).values()
    ).sort((a, b) => (a.date < b.date ? 1 : -1));
    const dedupedInvestmentAccounts = Array.from(
      new Map(investmentAccounts.map((acc) => [acc.id, acc])).values()
    );
    const dedupedInvestments = Array.from(
      new Map(investments.map((inv) => [inv.id, inv])).values()
    );
    const orderedAccounts = orderItemsByStoredIds(dedupedAccounts, user?.bankingAccountOrder ?? []);
    const orderedInvestmentAccounts = orderItemsByStoredIds(
      dedupedInvestmentAccounts,
      user?.investmentAccountOrder ?? []
    );

    res.json({
      accounts: orderedAccounts,
      transactions: dedupedTransactions,
      investmentAccounts: orderedInvestmentAccounts,
      investments: dedupedInvestments,
    });
  } catch (error: any) {
    appLogger.error('Get finance snapshot failed', {
      error: error.response?.data || error.message || error,
      userId: req.userId,
    });
    res.status(500).json({ error: '無法取得 Plaid 金融資料' });
  }
};