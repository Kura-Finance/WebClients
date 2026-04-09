import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppKit } from '@reown/appkit-react-native';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { useFinanceStore } from '../store/useFinanceStore';
import Logger from '../utils/Logger';

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  56: 'Binance Smart Chain',
  250: 'Fantom',
};

const CHAIN_NATIVE_SYMBOLS: Record<number, string> = {
  1: 'ETH',
  137: 'MATIC',
  42161: 'ETH',
  43114: 'AVAX',
  56: 'BNB',
  250: 'FTM',
};

const RPC_URLS: Record<number, string> = {
  1: 'https://eth-mainnet.public.blastapi.io',
  137: 'https://polygon-rpc.com',
  42161: 'https://arb1.arbitrum.io/rpc',
  43114: 'https://api.avax.network/ext/bc/C/rpc',
  56: 'https://bsc-dataseed1.binance.org:443',
  250: 'https://rpc.ftm.tools',
};

// 輪詢頻率配置
const POLL_INTERVALS = {
  FOREGROUND: 30000,  // 30s - 用戶正在使用應用
  BACKGROUND: 300000, // 5min - 應用在後台
  DISABLED: 0,        // 0 - 輪詢禁用
};

/**
 * Fetch native token balance for a wallet address on a specific chain
 */
async function fetchNativeBalance(address: string, chainId: number): Promise<number> {
  try {
    const rpcUrl = RPC_URLS[chainId];
    if (!rpcUrl) {
      Logger.warn('useWalletSync', `No RPC URL for chainId ${chainId}`);
      return 0;
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balanceWei = await provider.getBalance(address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));
    
    return balanceEth;
  } catch (err) {
    Logger.error('useWalletSync', 'Balance fetch failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return 0;
  }
}

/**
 * Unified hook for wallet connection management and sync
 * Monitors AppKit account state via AsyncStorage and syncs to Finance Store
 */
export function useWalletSync() {
  const { open: openAppKit } = useAppKit();
  const syncConnectedWalletPosition = useFinanceStore((state) => state.syncConnectedWalletPosition);
  const prevStateRef = useRef<{ address?: string; chainId?: number }>({});
  const [accountState, setAccountState] = useState<{ address?: string; chainId?: number }>({});
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 監聽 App 前後台狀態
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const isEnteringForeground = (
        appState.match(/inactive|background/) && nextAppState === 'active'
      );
      
      if (isEnteringForeground) {
        Logger.info('useWalletSync', '📱 App entered foreground');
        // 立即檢查一次
        checkAccountStateOnce();
      } else if (!nextAppState.match(/active|inactive/)) {
        Logger.info('useWalletSync', '📱 App entered background');
      }
      
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // 根據 App 狀態調整輪詢頻率
  useEffect(() => {
    const pollInterval = appState === 'active' 
      ? POLL_INTERVALS.FOREGROUND 
      : POLL_INTERVALS.BACKGROUND;

    // 清理舊的輪詢
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 設定新的輪詢頻率
    if (pollInterval > 0) {
      Logger.info('useWalletSync', `🔄 Polling interval set to ${pollInterval / 1000}s (${appState})`);
      
      // 立即檢查一次
      checkAccountStateOnce();
      
      // 設定定時輪詢
      intervalRef.current = setInterval(checkAccountStateOnce, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appState]);

  const checkAccountStateOnce = async () => {
    try {
      const namespaceKeys = await AsyncStorage.getAllKeys();
      const namespacesKey = namespaceKeys.find(key => 
        key.includes('universal_provider') && key.includes('/namespaces')
      );

      if (!namespacesKey) {
        setAccountState({});
        return;
      }

      const namespacesData = await AsyncStorage.getItem(namespacesKey);
      if (!namespacesData) {
        setAccountState({});
        return;
      }

      const namespaces = JSON.parse(namespacesData);
      const eip155 = namespaces.eip155;
      
      if (eip155?.accounts && eip155.accounts.length > 0) {
        const accountString = eip155.accounts[0];
        const [, chainIdStr, address] = accountString.split(':');
        const chainId = parseInt(chainIdStr, 10);

        setAccountState({ address, chainId });
      } else {
        setAccountState({});
      }
    } catch (err) {
      Logger.error('useWalletSync', 'Failed to read WalletConnect namespaces', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Sync wallet to store when account state changes
  useEffect(() => {
    const syncWalletToStore = async () => {
      const { address, chainId } = accountState;

      if (!address || !chainId) {
        return;
      }

      // Check if this is a new connection or first sync
      const isNewConnection = 
        !prevStateRef.current.address || 
        address !== prevStateRef.current.address || 
        chainId !== prevStateRef.current.chainId;

      if (!isNewConnection) {
        return;
      }

      prevStateRef.current = { address, chainId };

      const chainName = CHAIN_NAMES[chainId] || `Chain ${chainId}`;
      const nativeSymbol = CHAIN_NATIVE_SYMBOLS[chainId] || 'TOKEN';

      Logger.info('useWalletSync', '🔗 Connected: ' + chainName, {
        address: address.substring(0, 6) + '...',
        chainId,
      });

      try {
        // Fetch the actual native balance
        const nativeBalance = await fetchNativeBalance(address, chainId);

        await syncConnectedWalletPosition({
          address,
          chainId,
          chainName,
          nativeSymbol,
          nativeBalance,
        });

        Logger.info('useWalletSync', '✅ Synced: ' + nativeSymbol, {
          balance: nativeBalance,
        });
      } catch (err) {
        Logger.error('useWalletSync', '❌ Sync failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    syncWalletToStore();
  }, [accountState, syncConnectedWalletPosition]);

  // Re-sync when currency changes (to fetch price in new currency)
  const currency = useFinanceStore(state => state.currency);
  useEffect(() => {
    if (accountState.address && accountState.chainId) {
      Logger.info('useWalletSync', '💱 Currency changed, re-syncing wallet', { 
        currency,
        address: accountState.address.substring(0, 6) + '...',
        chainId: accountState.chainId,
      });
      
      const chainName = CHAIN_NAMES[accountState.chainId] || `Chain ${accountState.chainId}`;
      const nativeSymbol = CHAIN_NATIVE_SYMBOLS[accountState.chainId] || 'TOKEN';
      
      fetchNativeBalance(accountState.address, accountState.chainId).then(nativeBalance => {
        syncConnectedWalletPosition({
          address: accountState.address || '',
          chainId: accountState.chainId || 1,
          chainName,
          nativeSymbol,
          nativeBalance,
        });
      }).catch(err => {
        Logger.error('useWalletSync', 'Failed to re-sync on currency change', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }
  }, [currency, accountState.address, accountState.chainId, syncConnectedWalletPosition]);

  return {
    openWallet: useCallback(async () => {
      try {
        if (openAppKit) {
          const result = await openAppKit();
          return result;
        }
        throw new Error('Failed to open AppKit modal');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        Logger.error('useWalletSync', 'Failed to open AppKit modal', { error: errorMsg });
        throw err;
      }
    }, [openAppKit]),
    // 手動刷新函數 - 用於下拉刷新或按鈕點擊
    refreshBalance: useCallback(async () => {
      Logger.info('useWalletSync', '🔄 Manual refresh triggered');
      await checkAccountStateOnce();
    }, []),
    isConnected: !!accountState.address,
    address: accountState.address,
    chainId: accountState.chainId,
  };
}
