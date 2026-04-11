import { useState, useCallback } from 'react';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import { useExchangeStore } from '../../../shared/store/useExchangeStore';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

/**
 * Hook for managing Investment data refresh with pull-to-refresh UI state
 * Responsibility: Refresh both Plaid finance data AND exchange balances
 */
export function useRefreshInvestmentData() {
  const [refreshing, setRefreshing] = useState(false);
  const hydratePlaidFinanceData = useFinanceStore((state: any) => state.hydratePlaidFinanceData);
  const fetchExchangeBalances = useExchangeStore((state: any) => state.fetchExchangeBalances);
  const exchangeAccounts = useExchangeStore((state: any) => state.exchangeAccounts);
  const authToken = useAppStore((state: any) => state.authToken);

  const handleRefresh = useCallback(async () => {
    if (!authToken) {
      Logger.warn('useRefreshInvestmentData', 'No auth token available');
      return;
    }

    setRefreshing(true);
    try {
      Logger.debug('useRefreshInvestmentData', 'Refreshing investment data');

      // Refresh Plaid data
      await hydratePlaidFinanceData(authToken);
      Logger.info('useRefreshInvestmentData', 'Plaid data refreshed');

      // Refresh Exchange data for all connected accounts
      if (exchangeAccounts.length > 0) {
        Logger.debug('useRefreshInvestmentData', `Refreshing ${exchangeAccounts.length} exchange accounts`);
        const exchangeRefreshPromises = exchangeAccounts.map((account: any) =>
          fetchExchangeBalances(account.id, authToken).catch((error: any) => {
            Logger.warn('useRefreshInvestmentData', `Failed to refresh exchange account ${account.id}`, error);
          })
        );
        await Promise.all(exchangeRefreshPromises);
        Logger.info('useRefreshInvestmentData', 'Exchange data refreshed');
      }

      Logger.info('useRefreshInvestmentData', 'All investment data refreshed successfully');
    } catch (error) {
      Logger.error('useRefreshInvestmentData', 'Failed to refresh investment data', error);
    } finally {
      setRefreshing(false);
    }
  }, [authToken, hydratePlaidFinanceData, fetchExchangeBalances, exchangeAccounts]);

  return {
    refreshing,
    handleRefresh,
  };
}
