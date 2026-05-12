import { create } from 'zustand';
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
  logoutUser,
  deleteCurrentUserAccount,
  requestPasswordReset as requestPasswordResetApi,
  requestRegistrationCode as requestRegistrationCodeApi,
} from '@/lib/authApi';
import {
  zkLogin,
  zkVerifyRegistration,
  clearCryptoSession,
  zkChangePassword,
  zkResetPassword,
} from '@/lib/crypto/zkAuth';
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
  disconnectPlaidAccount as disconnectPlaidAccountApi,
} from '@/lib/plaidApi';
import { useFinanceStore } from './useFinanceStore';

export type BaseCurrency = 'USD' | 'EUR' | 'TWD';

export interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string;
  membershipLabel: string;
}

export interface UserPreferences {
  baseCurrency: BaseCurrency;
  largeTransactionAlerts: boolean;
  weeklyAiSummary: boolean;
}

interface AppState {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  /**
   * 是否擁有有效的 in-memory crypto session（X25519 私鑰已解開）。
   * Page reload 後即使 cookie 有效，此值也是 false，直到用戶重新輸入密碼。
   * 加密功能（asset history 解密）依賴此旗標。
   */
  isDecryptionReady: boolean;
  userProfile: UserProfile;
  preferences: UserPreferences;
  isBalanceHidden: boolean;
  plaidLinkToken: string | null;
  authToken: string | null;
  authError: string | null;

  // 認證方法
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (resetCode: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  requestRegistrationCode: (email: string) => Promise<void>;
  verifyRegistration: (email: string, password: string, verificationCode: string) => Promise<void>;
  hydrateFromStorage: () => Promise<void>;

  // 使用者方法
  setDisplayName: (displayName: string) => Promise<void>;
  setBaseCurrency: (currency: BaseCurrency) => void;
  toggleLargeTransactionAlerts: () => void;
  toggleWeeklyAiSummary: () => void;
  toggleBalanceVisibility: () => void;
  setPlaidLinkToken: (token: string | null) => void;
  clearAuthSession: () => void;
  hydrateUserProfile: () => Promise<void>;

  // Plaid 方法
  requestPlaidLinkToken: () => Promise<string | null>;
  confirmPlaidExchange: (publicToken: string, institutionName?: string) => Promise<void>;
  disconnectPlaidAccount: (accountId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  authStatus: 'loading',
  isDecryptionReady: false,
  userProfile: {
    displayName: '',
    email: '',
    avatarUrl: '',
    membershipLabel: '',
  },
  preferences: {
    baseCurrency: 'USD',
    largeTransactionAlerts: false,
    weeklyAiSummary: false,
  },
  isBalanceHidden: false,
  plaidLinkToken: null,
  authToken: null,
  authError: null,

  // 認證方法
  login: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.debug('[AppStore] Attempting ZK login', { email: normalizedEmail });
      set({ authStatus: 'loading', authError: null });

      const response = await zkLogin(normalizedEmail, password);

      set({
        authToken: 'web-client',
        authStatus: 'authenticated',
        isDecryptionReady: true,
        userProfile: {
          displayName: response.user.displayName,
          email: normalizedEmail,
          avatarUrl: response.user.avatarUrl || '',
          membershipLabel: response.user.membershipLabel || '',
        },
        authError: null,
        preferences: { baseCurrency: 'USD', largeTransactionAlerts: false, weeklyAiSummary: false },
      });

      const { hydratePlaidFinanceData, hydrateAssetHistory } = useFinanceStore.getState();
      try {
        await hydratePlaidFinanceData();
      } catch (plaidError) {
        console.warn('[AppStore] Failed to auto-load Plaid data after login', plaidError);
      }
      // Decrypt asset history now that the crypto session is established
      try {
        await hydrateAssetHistory(30);
      } catch (assetError) {
        console.warn('[AppStore] Failed to load asset history after login', assetError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('[AppStore] Login failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authError: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.info('[AppStore] Logging out');
      await logoutUser();
      // 清除記憶體中的 Data Key（ZK 安全保證）
      clearCryptoSession();
      set({
        authToken: null,
        authStatus: 'unauthenticated',
        isDecryptionReady: false,
        userProfile: { displayName: '', email: '', avatarUrl: '', membershipLabel: '' },
        plaidLinkToken: null,
        authError: null,
      });
      console.info('[AppStore] Logout successful');
    } catch (error) {
      console.error('[AppStore] Logout failed', error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      console.info('[AppStore] Deleting account');
      await deleteCurrentUserAccount();
      clearCryptoSession();
      set({
        authToken: null,
        authStatus: 'unauthenticated',
        userProfile: { displayName: '', email: '', avatarUrl: '', membershipLabel: '' },
        plaidLinkToken: null,
        authError: null,
      });
      console.info('[AppStore] Account deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account deletion failed';
      console.error('[AppStore] Account deletion failed', { error: errorMessage });
      throw error;
    }
  },

  changePassword: async (resetCode: string, newPassword: string) => {
    try {
      console.debug('[AppStore] Changing password (SRP)');
      const email = get().userProfile?.email;
      if (!email) throw new Error('Current user email is missing.');
      await zkChangePassword(email, resetCode, newPassword);
      console.info('[AppStore] Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      console.error('[AppStore] Password change failed', { error: errorMessage });
      throw error;
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      console.debug('[AppStore] Requesting password reset', { email });
      await requestPasswordResetApi(email);
      console.info('[AppStore] Password reset email sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      console.error('[AppStore] Password reset request failed', { error: errorMessage });
      throw error;
    }
  },

  resetPassword: async (email: string, resetCode: string, newPassword: string) => {
    try {
      console.debug('[AppStore] Resetting password with ZK protocol');
      await zkResetPassword(email, resetCode, newPassword);
      console.info('[AppStore] Password reset successfully');
      
      // 由於舊 Data Key 已失效，系統需要登出以重新建立安全工作階段
      get().clearAuthSession();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      console.error('[AppStore] Password reset failed', { error: errorMessage });
      throw error;
    }
  },

  requestRegistrationCode: async (email: string) => {
    try {
      console.debug('[AppStore] Requesting registration code', { email });
      await requestRegistrationCodeApi(email);
      console.info('[AppStore] Registration verification code sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration code request failed';
      console.error('[AppStore] Registration code request failed', { error: errorMessage });
      throw error;
    }
  },

  verifyRegistration: async (email: string, password: string, verificationCode: string) => {
    try {
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters.');
      }

      console.debug('[AppStore] Verifying registration', { email });
      const response = await zkVerifyRegistration(email, password, verificationCode);
      // Web 客戶端：註冊成功後必須先確認 Cookie session 已建立。
      const profile = await fetchCurrentUserProfile();

      console.info('[AppStore] Registration confirmed successfully');
      set({
        authToken: 'web-client', // 標記為 web 客戶端（token 在 cookie 中）
        authStatus: 'authenticated',
        isDecryptionReady: true,
        userProfile: {
          displayName: profile.user.displayName || response.user.displayName,
          email: profile.user.email || response.user.email,
          avatarUrl: profile.user.avatarUrl || response.user.avatarUrl || '',
          membershipLabel: profile.user.membershipLabel || response.user.membershipLabel || '',
        },
        authError: null,
        preferences: {
          baseCurrency: 'USD',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
      });

      const { hydratePlaidFinanceData: hydratePlaid2, hydrateAssetHistory: hydrateAsset2 } = useFinanceStore.getState();
      try {
        console.debug('[AppStore] Auto-loading Plaid finance data after registration confirmation');
        await hydratePlaid2();
        console.info('[AppStore] Plaid finance data auto-loaded after registration confirmation');
      } catch (plaidError) {
        console.warn('[AppStore] Failed to auto-load Plaid data after registration confirmation', plaidError);
      }
      try {
        await hydrateAsset2(30);
      } catch (assetError) {
        console.warn('[AppStore] Failed to load asset history after registration', assetError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration confirmation failed';
      console.error('[AppStore] Registration confirmation failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authToken: null });
      throw error;
    }
  },

  hydrateFromStorage: async () => {
    try {
      console.debug('[AppStore] Hydrating from storage');
      set({ authStatus: 'loading' });

      // 僅在客戶端執行
      if (typeof window === 'undefined') {
        set({ authStatus: 'unauthenticated', authError: null });
        return;
      }

      set({ isBalanceHidden: localStorage.getItem('kura-hide-balance') === '1' });

      // Web 客戶端：Token 在 HttpOnly Cookie 中，直接嘗試呼叫 API
      console.debug('[AppStore] Web client - attempting to fetch profile from cookie');
      try {
        const response = await fetchCurrentUserProfile();

        console.info('[AppStore] Profile fetched successfully');
        set({
          authToken: 'web-client', // 標記為 web 客戶端（token 在 cookie 中）
          authStatus: 'authenticated',
          userProfile: {
            displayName: response.user.displayName,
            email: response.user.email,
            avatarUrl: response.user.avatarUrl || '',
            membershipLabel: response.user.membershipLabel || '',
          },
          authError: null,
          preferences: {
            baseCurrency: 'USD',
            largeTransactionAlerts: false,
            weeklyAiSummary: false,
          },
        });

        // Phase 3 E2EE：頁面重載後 crypto session 已清除，無法解密 Plaid 資料。
        // 等用戶重新輸入密碼後，login() 會再次呼叫 hydratePlaidFinanceData()。
        console.debug('[AppStore] Page reload — skipping Plaid auto-load (no crypto session; re-login required to decrypt)');
      } catch {
        // 無有效 cookie 或 session
        console.info('[AppStore] No valid session found');
        set({ authStatus: 'unauthenticated', authError: null, authToken: null });
      }
    } catch (error) {
      console.warn('[AppStore] Failed to hydrate from storage', error);
      set({ authStatus: 'unauthenticated', authToken: null });
    }
  },

  // 使用者方法
  setDisplayName: async (displayName) => {
    try {
      console.debug('[AppStore] Updating display name', { displayName });
      const response = await updateCurrentUserProfile({ displayName });
      console.info('[AppStore] Display name updated');

      set((state) => ({
        userProfile: {
          ...state.userProfile,
          displayName: response.user.displayName,
        },
      }));
    } catch (error) {
      console.error('[AppStore] Failed to update display name', error);
    }
  },

  setBaseCurrency: (baseCurrency) =>
    set((state) => ({ preferences: { ...state.preferences, baseCurrency } })),

  toggleLargeTransactionAlerts: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        largeTransactionAlerts: !state.preferences.largeTransactionAlerts,
      },
    })),

  toggleWeeklyAiSummary: () =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        weeklyAiSummary: !state.preferences.weeklyAiSummary,
      },
    })),

  toggleBalanceVisibility: () =>
    set((state) => {
      const nextHidden = !state.isBalanceHidden;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kura-hide-balance', nextHidden ? '1' : '0');
      }
      return { isBalanceHidden: nextHidden };
    }),

  setPlaidLinkToken: (plaidLinkToken) => set({ plaidLinkToken }),

  clearAuthSession: () => {
    set(() => ({
      authToken: null,
      authStatus: 'unauthenticated',
      plaidLinkToken: null,
      userProfile: {
        displayName: '',
        email: '',
        avatarUrl: '',
        membershipLabel: '',
      },
      authError: null,
    }));
  },

  hydrateUserProfile: async () => {
    try {
      const response = await fetchCurrentUserProfile();
      set({
        userProfile: {
          displayName: response.user.displayName,
          email: response.user.email,
          avatarUrl: response.user.avatarUrl || '',
          membershipLabel: response.user.membershipLabel || '',
        },
        authStatus: 'authenticated',
      });
    } catch (error) {
      console.error('[AppStore] Failed to hydrate user profile', error);
      set({ authStatus: 'unauthenticated' });
    }
  },

  // Plaid 方法
  requestPlaidLinkToken: async () => {
    try {
      console.debug('[AppStore] Requesting Plaid link token');
      const result = await createPlaidLinkToken();
      console.debug('[AppStore] Plaid API response received', { result });

      const token = result.link_token;
      if (!token) {
        console.error('[AppStore] No link token in response', { result });
        throw new Error('No link token returned from backend');
      }

      set({ plaidLinkToken: token });
      console.info('[AppStore] Plaid link token received', { token });
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get Plaid link token';
      console.error('[AppStore] Failed to request Plaid link token', { error: errorMessage });
      throw error;
    }
  },

  confirmPlaidExchange: async (publicToken: string, institutionName?: string) => {
    try {
      console.debug('[AppStore] Exchanging Plaid public token', {
        institution: institutionName,
      });

      const result = await exchangePlaidPublicToken({
        public_token: publicToken,
        institution_name: institutionName,
      });

      console.info('[AppStore] Plaid token exchanged successfully', { result });

      // 載入更新後的財務資料
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData();

      // 清除 link token
      set({ plaidLinkToken: null });
      console.info('[AppStore] Finance data reloaded after Plaid exchange');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to exchange Plaid token';
      console.error('[AppStore] Plaid exchange failed', { error: errorMessage });
      throw error;
    }
  },

  disconnectPlaidAccount: async (accountId: string) => {
    try {
      console.debug('[AppStore] Disconnecting Plaid account', { accountId });

      const result = await disconnectPlaidAccountApi(accountId);
      console.info('[AppStore] Plaid account disconnected successfully', { result });

      // 更新本地 state 以移除帳戶
      const disconnectBankingAccount = useFinanceStore.getState().disconnectBankingAccount;
      await disconnectBankingAccount(accountId);

      // 重新載入更新後的財務資料
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Plaid account';
      console.error('[AppStore] Failed to disconnect Plaid account', { error: errorMessage });
      throw error;
    }
  },
}));
