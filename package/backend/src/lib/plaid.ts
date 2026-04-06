import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';
dotenv.config();

const plaidEnv = process.env.PLAID_ENV || 'sandbox';
const basePath = PlaidEnvironments[plaidEnv];

if (!basePath) {
  throw new Error(`Invalid PLAID_ENV value: ${plaidEnv}`);
}

const configuration = new Configuration({
  basePath,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);