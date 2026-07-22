'use client';

/**
 * Privy 認證 Provider（對齊 backendserver / react-native）。
 *
 * 登入由 Privy 驅動：前端用 Privy SDK 完成登入 → 取得 access/identity token，
 * 再由 PrivyAuthBridge 換取 Kura session（HttpOnly cookie）。
 *
 * 若未設定 NEXT_PUBLIC_PRIVY_APP_ID，則略過 Privy（app 仍可建置），
 * 但登入功能會停用。
 */

import type { ReactNode } from 'react';
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import PrivyAuthBridge from '@/components/PrivyAuthBridge';
import { env, isPrivyConfigured } from '@/config/env';

export { isPrivyConfigured };

export default function PrivyProvider({ children }: { children: ReactNode }) {
  if (!env.privyAppId) {
    if (typeof window !== 'undefined') {
      console.warn('[PrivyProvider] NEXT_PUBLIC_PRIVY_APP_ID is missing — authentication is disabled.');
    }
    return <>{children}</>;
  }

  return (
    <BasePrivyProvider
      appId={env.privyAppId}
      config={{
        loginMethods: ['email', 'google', 'apple'],
        appearance: {
          theme: 'light',
          accentColor: '#6366F1',
          walletChainType: 'ethereum-only',
        },
        embeddedWallets: {
          // Create an embedded EOA for users who don't have one yet (Signer card / SCA owner).
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
        // Login is social/email only — skip WalletConnect registry prefetch
        // (explorer-api.walletconnect.com/v3/wallets) which Safari reports as
        // "Could not connect to the server (wallets)".
        externalWallets: {
          walletConnect: { enabled: false },
        },
      }}
    >
      <PrivyAuthBridge />
      {children}
    </BasePrivyProvider>
  );
}
