import { StateCreator } from 'zustand';
import { PlaidState, FinanceState } from './types';
import { fetchPlaidFinanceSnapshot } from '../../api/plaidApi';
import Logger from '../../utils/Logger';

/**
 * Plaid Slice - 處理 Plaid 爬取邏輯
 * 包括：水合數據、清除數據、交易所帳戶
 */
export const createPlaidSlice: StateCreator<FinanceState, [], [], PlaidState> = (set, get) => ({
  // Initial State
  isLoadingPlaidData: false,
  plaidError: null,
  lastRefreshInfo: null,
  cacheSource: null,

  // ========================================================================
  // Plaid Data Hydration
  // ========================================================================

  hydratePlaidFinanceData: async (token: string, refresh: boolean = false) => {
    try {
      set({ isLoadingPlaidData: true, plaidError: null });
      Logger.debug('PlaidSlice', 'Fetching Plaid finance snapshot', { refresh });

      const snapshot = await fetchPlaidFinanceSnapshot(token, refresh);
      Logger.info('PlaidSlice', 'Plaid snapshot fetched successfully', {
        accountsCount: snapshot.accounts.length,
        transactionsCount: snapshot.transactions.length,
        investmentAccountsCount: snapshot.investmentAccounts.length,
        cacheSource: snapshot._cacheSource,
        hasRefreshInfo: !!snapshot._refreshInfo,
      });
      
      // Log first transaction logo data for debugging
      if (snapshot.transactions.length > 0) {
        const firstTransaction = snapshot.transactions[0];
        Logger.debug('PlaidSlice', 'First transaction logo data', {
          merchant: firstTransaction.merchant,
          plaidMerchantLogo: !!firstTransaction.plaidMerchantLogo,
          merchantLogo: !!firstTransaction.merchantLogo,
          plaidLogoUrl: firstTransaction.plaidMerchantLogo?.substring(0, 50),
          clearbitLogoUrl: firstTransaction.merchantLogo?.substring(0, 50),
        });
      }

      set((state) => {
        // Preserve Web3 Wallet and Exchange accounts (not managed by Plaid)
        const nonPlaidAccounts = state.investmentAccounts.filter(
          (account) => account.type === 'Web3 Wallet' || account.type === 'Exchange'
        );
        const nonPlaidInvestments = state.investments.filter((investment) =>
          nonPlaidAccounts.some((account) => account.id === investment.accountId)
        );

        Logger.debug('PlaidSlice', 'Preserving non-Plaid data', {
          nonPlaidAccountsCount: nonPlaidAccounts.length,
          nonPlaidInvestmentsCount: nonPlaidInvestments.length,
        });

        return {
          accounts: snapshot.accounts,
          transactions: snapshot.transactions,
          investmentAccounts: [...snapshot.investmentAccounts, ...nonPlaidAccounts],
          investments: [...snapshot.investments, ...nonPlaidInvestments],
          isLoadingPlaidData: false,
          lastRefreshInfo: snapshot._refreshInfo || null,
          cacheSource: snapshot._cacheSource || null,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch Plaid finance data';
      Logger.error('PlaidSlice', 'Failed to hydrate Plaid data', {
        error: errorMessage,
      });
      set({ isLoadingPlaidData: false, plaidError: errorMessage });
      throw error;
    }
  },

  clearPlaidFinanceData: () => {
    Logger.info('PlaidSlice', 'Clearing Plaid finance data');

    set((state) => {
      // Only clear Plaid data, preserve Web3 Wallet and Exchange accounts
      const nonPlaidAccounts = state.investmentAccounts.filter(
        (account) => account.type === 'Web3 Wallet' || account.type === 'Exchange'
      );
      const nonPlaidInvestments = state.investments.filter((investment) =>
        nonPlaidAccounts.some((account) => account.id === investment.accountId)
      );

      Logger.debug('PlaidSlice', 'Cleared Plaid data, preserved non-Plaid accounts', {
        preservedAccountsCount: nonPlaidAccounts.length,
        preservedInvestmentsCount: nonPlaidInvestments.length,
      });

      return {
        accounts: [],
        transactions: [],
        investmentAccounts: nonPlaidAccounts,
        investments: nonPlaidInvestments,
        plaidError: null,
      };
    });
  },

  // ========================================================================
  // Exchange Account Hydration
  // ========================================================================

  hydrateExchangeAccounts: async (token: string) => {
    try {
      Logger.debug(
        'PlaidSlice',
        'Hydrating exchange accounts (delegated to ExchangeStore)'
      );
      const { useExchangeStore } = await import('../useExchangeStore');
      await useExchangeStore.getState().hydrateExchangeAccounts(token);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to hydrate exchange accounts';
      Logger.error('PlaidSlice', 'Failed to hydrate exchange accounts', {
        error: errorMessage,
      });
      // Don't throw - exchange accounts are optional
    }
  },
});
