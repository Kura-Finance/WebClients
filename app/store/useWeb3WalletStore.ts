import { create } from 'zustand';
import { InvestmentAccount, Investment } from './useFinanceStore';

interface Web3WalletState {
  // Web3 Wallet 專用資料
  walletAccounts: InvestmentAccount[];
  walletInvestments: Investment[];
  
  // 操作
  addWalletPosition: (account: InvestmentAccount, investment: Investment) => void;
  removeWalletPosition: (accountId: string, investmentId: string) => void;
  clearAll: () => void;
  
  // 選擇器
  getTotalWalletValue: () => number;
  getWalletAccountIds: () => string[];
  getWalletInvestmentIds: () => string[];
}

export const useWeb3WalletStore = create<Web3WalletState>((set, get) => ({
  // 初始狀態
  walletAccounts: [],
  walletInvestments: [],
  
  // 操作
  addWalletPosition: (account: InvestmentAccount, investment: Investment) => {
    const { walletAccounts, walletInvestments } = get();
    
    console.debug('[Web3WalletStore] Adding wallet position:', {
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
    
    console.debug('[Web3WalletStore] Removing wallet position:', {
      accountId,
      investmentId,
    });
    
    set({
      walletAccounts: walletAccounts.filter(a => a.id !== accountId),
      walletInvestments: walletInvestments.filter(i => i.id !== investmentId),
    });
  },
  
  clearAll: () => {
    console.warn('[Web3WalletStore] Clearing all Web3 wallet data');
    set({
      walletAccounts: [],
      walletInvestments: [],
    });
  },
  
  // 選擇器
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
