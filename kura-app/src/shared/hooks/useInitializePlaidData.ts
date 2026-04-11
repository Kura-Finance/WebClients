import { useEffect } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAppStore } from '../store/useAppStore';
import Logger from '../utils/Logger';

/**
 * Hook for initial Plaid data load on component mount
 * Responsibility: Load Plaid data only once if not already loaded
 * This replaces the App startup auto-load when user navigates to Dashboard/Investment
 */
export function useInitializePlaidData() {
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const accounts = useFinanceStore((state) => state.accounts);
  const authToken = useAppStore((state) => state.authToken);

  useEffect(() => {
    const loadData = async () => {
      // Only load if:
      // 1. We have auth token
      // 2. No accounts are loaded yet (first time)
      if (!authToken || accounts.length > 0) {
        return;
      }

      try {
        Logger.debug('useInitializePlaidData', 'Loading Plaid data on first mount');
        await hydratePlaidFinanceData(authToken);
        Logger.info('useInitializePlaidData', 'Plaid data loaded on component mount');
      } catch (error) {
        Logger.warn('useInitializePlaidData', 'Failed to initialize Plaid data', error);
      }
    };

    loadData();
  }, [authToken, accounts.length, hydratePlaidFinanceData]);
}
