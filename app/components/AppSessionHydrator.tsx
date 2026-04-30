"use client";

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { type Investment, useFinanceStore } from '@/store/useFinanceStore';
import { useAccount, useChainId } from 'wagmi';
import { fetchDeBankProtocolPositions, fetchDeBankTokenPositions } from '@/lib/debankApi';

const CHAIN_NAME_BY_ID: Record<number, string> = {
  1: 'Ethereum',
  137: 'Polygon',
  42161: 'Arbitrum',
};

function normalizeAddress(value: string | undefined): string | null {
  if (!value) return null;
  return value.toLowerCase();
}

export default function AppSessionHydrator() {
  const authToken = useAppStore((state) => state.authToken);
  const authStatus = useAppStore((state) => state.authStatus);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const hydrateUserProfile = useAppStore((state) => state.hydrateUserProfile);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);
  const hydrateEncryptedFinanceCache = useFinanceStore((state) => state.hydrateEncryptedFinanceCache);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const clearPlaidFinanceData = useFinanceStore((state) => state.clearPlaidFinanceData);
  const syncConnectedWalletAssets = useFinanceStore((state) => state.syncConnectedWalletAssets);
  const setDebankLastSyncedAt = useFinanceStore((state) => state.setDebankLastSyncedAt);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const lastSyncedWalletKeyRef = useRef<string | null>(null);
  const lastConnectedWalletRef = useRef<{ address: string; chainId: number } | null>(null);

  // 首次載入時從儲存狀態初始化認證
  useEffect(() => {
    if (authStatus === 'loading' && !authToken) {
      void hydrateFromStorage();
    }
  }, [authStatus, authToken, hydrateFromStorage]);

  useEffect(() => {
    if (authStatus !== 'loading') {
      return;
    }

    if (!authToken) {
      clearAuthSession();
      return;
    }

    void (async () => {
      await hydrateUserProfile();
      const latestState = useAppStore.getState();
      if (latestState.authStatus === 'authenticated' && latestState.authToken) {
        try {
          await hydrateEncryptedFinanceCache();
          await hydratePlaidFinanceData();
        } catch {
          // 即使 Plaid API 暫時不可用，也維持 UI 可用。
        }
      }
    })();
  }, [authStatus, authToken, clearAuthSession, hydrateUserProfile, hydrateEncryptedFinanceCache, hydratePlaidFinanceData]);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      clearPlaidFinanceData();
    }
  }, [authStatus, clearPlaidFinanceData]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !isConnected) {
      return;
    }

    const normalizedAddress = normalizeAddress(address);
    if (!normalizedAddress) {
      return;
    }

    const walletKey = `${chainId}:${normalizedAddress}`;
    if (lastSyncedWalletKeyRef.current === walletKey) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const [tokenResponse, protocolResponse] = await Promise.all([
          fetchDeBankTokenPositions(normalizedAddress, true),
          fetchDeBankProtocolPositions(normalizedAddress, true),
        ]);
        const tokens = tokenResponse.positions;
        const protocols = protocolResponse.positions;
        setDebankLastSyncedAt(tokenResponse.lastSyncedAt ?? protocolResponse.lastSyncedAt ?? null);

        if (cancelled) {
          return;
        }

        const accountId = `wallet-${chainId}-${normalizedAddress}`;
        const tokenAssets: Investment[] = tokens.map((token) => ({
          id: `wallet-token-${chainId}-${normalizedAddress}-${token.id}`,
          accountId,
          symbol: token.symbol || 'TOKEN',
          name: token.name || token.symbol || 'Token',
          holdings: token.amount,
          currentPrice: token.price,
          change24h: 0,
          type: 'crypto',
          logo: token.logo,
        }));
        const protocolAssets: Investment[] = protocols
          .filter((protocol) => protocol.usdValue > 0)
          .map((protocol) => ({
            id: `wallet-protocol-${chainId}-${normalizedAddress}-${protocol.id}`,
            accountId,
            symbol: 'LP',
            name: protocol.name,
            holdings: 1,
            currentPrice: protocol.usdValue,
            change24h: 0,
            type: 'crypto',
            logo: protocol.logo,
          }));

        syncConnectedWalletAssets({
          address: normalizedAddress,
          chainId,
          chainName: CHAIN_NAME_BY_ID[chainId] ?? `Chain ${chainId}`,
          assets: [...tokenAssets, ...protocolAssets],
        });
        lastSyncedWalletKeyRef.current = walletKey;
        lastConnectedWalletRef.current = { address: normalizedAddress, chainId };
      } catch (error) {
        console.warn('[AppSessionHydrator] Failed to sync DeBank data', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, authStatus, chainId, isConnected, setDebankLastSyncedAt, syncConnectedWalletAssets]);

  useEffect(() => {
    if (isConnected && address) {
      const normalizedAddress = normalizeAddress(address);
      if (normalizedAddress) {
        lastConnectedWalletRef.current = { address: normalizedAddress, chainId };
      }
      return;
    }

    // 自動斷線/切換錢包時不主動清除前端資料，僅重置同步狀態。
    lastConnectedWalletRef.current = null;
    lastSyncedWalletKeyRef.current = null;
  }, [address, chainId, isConnected]);

  return null;
}