import { create } from 'zustand';
import { InvestmentAccount, Investment } from './useFinanceStore';
import Logger from '../utils/Logger';

interface Web3WalletState {
  // Web3 Wallet 專用数据
  walletAccounts: InvestmentAccount[];
  walletInvestments: Investment[];
  
  // Actions
  addWalletPosition: (account: InvestmentAccount, investment: Investment) => void;
  removeWalletPosition: (accountId: string, investmentId: string) => void;
  clearAll: () => void;
  
  // Selectors
  getTotalWalletValue: () => number;
  getWalletAccountIds: () => string[];
  getWalletInvestmentIds: () => string[];
}

export const useWeb3WalletStore = create<Web3WalletState>((set, get) => ({
  // Initial State
  walletAccounts: [],
  walletInvestments: [],
  
  // Actions
  addWalletPosition: (account: InvestmentAccount, investment: Investment) => {
    const { walletAccounts, walletInvestments } = get();
    
    Logger.info('Web3WalletStore', '➕ Adding wallet position:', {
      accountId: account.id,
      investmentId: investment.id,
      symbol: investment.symbol,
      chainName: account.name,
    });
    
    set({
      walletAccounts: [
        ...walletAccounts.filter(a => a.id !== account.id),
        account,
      ],
      walletInvestments: [
        ...walletInvestments.filter(i => i.id !== investment.id),
        investment,
      ],
    });
  },
  
  removeWalletPosition: (accountId: string, investmentId: string) => {
    const { walletAccounts, walletInvestments } = get();
    
    Logger.info('Web3WalletStore', '➖ Removing wallet position:', {
      accountId,
      investmentId,
    });
    
    set({
      walletAccounts: walletAccounts.filter(a => a.id !== accountId),
      walletInvestments: walletInvestments.filter(i => i.id !== investmentId),
    });
  },
  
  clearAll: () => {
    Logger.warn('Web3WalletStore', '🗑️ Clearing all Web3 wallet data');
    set({
      walletAccounts: [],
      walletInvestments: [],
    });
  },
  
  // Selectors
  getTotalWalletValue: () => {
    const { walletInvestments } = get();
    return walletInvestments.reduce(
      (sum, inv) => sum + inv.holdings * inv.currentPrice,
      0
    );
  },
  
  getWalletAccountIds: () => {
    const { walletAccounts } = get();
    return walletAccounts.map(a => a.id);
  },
  
  getWalletInvestmentIds: () => {
    const { walletInvestments } = get();
    return walletInvestments.map(i => i.id);
  },
}));
