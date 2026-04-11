import { useState, useCallback } from 'react';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

/**
 * Hook for managing Dashboard data refresh with pull-to-refresh UI state
 * Responsibility: Refresh Plaid finance data (accounts & transactions)
 */
export function useRefreshDashboardData() {
  const [refreshing, setRefreshing] = useState(false);
  const hydratePlaidFinanceData = useFinanceStore((state: any) => state.hydratePlaidFinanceData);
  const authToken = useAppStore((state: any) => state.authToken);

  const handleRefresh = useCallback(async () => {
    if (!authToken) {
      Logger.warn('useRefreshDashboardData', 'No auth token available');
      return;
    }

    setRefreshing(true);
    try {
      Logger.debug('useRefreshDashboardData', 'Refreshing Plaid data');
      await hydratePlaidFinanceData(authToken);
      Logger.info('useRefreshDashboardData', 'Plaid data refreshed successfully');
    } catch (error) {
      Logger.error('useRefreshDashboardData', 'Failed to refresh Plaid data', error);
    } finally {
      setRefreshing(false);
    }
  }, [authToken, hydratePlaidFinanceData]);

  return {
    refreshing,
    handleRefresh,
  };
}
