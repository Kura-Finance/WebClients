import { create } from 'zustand';
import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  changePassword as changePasswordApi,
  requestPasswordReset as requestPasswordResetApi,
  resetPassword as resetPasswordApi,
  requestRegisterToken as requestRegisterTokenApi,
  confirmRegister as confirmRegisterApi,
} from '@/lib/authApi';
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
  disconnectPlaidAccount as disconnectPlaidAccountApi,
  fetchPlaidFinanceSnapshot,
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

export interface AiInsight {
  id: 'spending-alert' | 'optimization';
  title: string;
  content: string;
}

export interface AppChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

interface AppState {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  userProfile: UserProfile;
  preferences: UserPreferences;
  aiInsights: AiInsight[];
  chatMessages: AppChatMessage[];
  plaidLinkToken: string | null;
  authToken: string | null;
  authError: string | null;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ resetToken?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<void>;
  requestRegisterToken: (email: string) => Promise<{ registerToken?: string }>;
  confirmRegister: (email: string, password: string, registerToken: string) => Promise<void>;
  hydrateFromStorage: () => Promise<void>;

  // User methods
  setDisplayName: (displayName: string) => Promise<void>;
  setBaseCurrency: (currency: BaseCurrency) => void;
  toggleLargeTransactionAlerts: () => void;
  toggleWeeklyAiSummary: () => void;
  addChatMessage: (message: AppChatMessage) => void;
  setPlaidLinkToken: (token: string | null) => void;
  setAuthToken: (token: string | null) => void;
  clearAuthSession: () => void;
  hydrateUserProfile: () => Promise<void>;

  // Plaid methods
  requestPlaidLinkToken: () => Promise<string | null>;
  confirmPlaidExchange: (publicToken: string, institutionName?: string) => Promise<void>;
  disconnectPlaidAccount: (accountId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  authStatus: 'loading',
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
  aiInsights: [],
  chatMessages: [],
  plaidLinkToken: null,
  authToken: null,
  authError: null,

  // Auth methods
  login: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.debug('[AppStore] Attempting login', { email: normalizedEmail });
      set({ authStatus: 'loading', authError: null });

      const response = await loginUser(normalizedEmail, password);
      // Web 客户端: Token 存储在 HttpOnly Cookie 中，无需手动存储

      console.info('[AppStore] Login successful', { email: normalizedEmail });
      set({
        authToken: 'web-client', // 标记为 web 客户端（token 在 cookie 中）
        authStatus: 'authenticated',
        userProfile: {
          displayName: response.user.displayName,
          email: normalizedEmail,
          avatarUrl: response.user.avatarUrl || '',
          membershipLabel: response.user.membershipLabel || '',
        },
        authError: null,
        preferences: {
          baseCurrency: 'USD',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        console.debug('[AppStore] Auto-loading Plaid finance data after login');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData();
        console.info('[AppStore] Plaid finance data auto-loaded after login');

        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the login if it fails
        console.warn('[AppStore] Failed to auto-load Plaid data after login', plaidError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('[AppStore] Login failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authError: errorMessage });
      throw error;
    }
  },

  signup: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.debug('[AppStore] Attempting signup', { email: normalizedEmail });
      set({ authStatus: 'loading', authError: null });

      const response = await registerUser(normalizedEmail, password);
      // Web 客户端: Token 存储在 HttpOnly Cookie 中，无需手动存储

      console.info('[AppStore] Signup successful', { email: normalizedEmail });
      set({
        authToken: 'web-client', // 标记为 web 客户端（token 在 cookie 中）
        authStatus: 'authenticated',
        userProfile: {
          displayName: response.user.displayName,
          email: normalizedEmail,
          avatarUrl: response.user.avatarUrl || '',
          membershipLabel: response.user.membershipLabel || '',
        },
        authError: null,
        preferences: {
          baseCurrency: 'USD',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        console.debug('[AppStore] Auto-loading Plaid finance data after signup');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData();
        console.info('[AppStore] Plaid finance data auto-loaded after signup');

        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the signup if it fails
        console.warn('[AppStore] Failed to auto-load Plaid data after signup', plaidError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      console.error('[AppStore] Signup failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authError: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.info('[AppStore] Logging out');
      // 调用后端登出 API，清除 HttpOnly Cookie
      await logoutUser();
      
      set({
        authToken: null,
        authStatus: 'unauthenticated',
        userProfile: {
          displayName: '',
          email: '',
          avatarUrl: '',
          membershipLabel: '',
        },
        plaidLinkToken: null,
        authError: null,
      });
      console.info('[AppStore] Logout successful');
    } catch (error) {
      console.error('[AppStore] Logout failed', error);
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      console.debug('[AppStore] Changing password');
      await changePasswordApi(oldPassword, newPassword);
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
      const response = await requestPasswordResetApi(email);
      console.info('[AppStore] Password reset email sent', { resetToken: response.resetToken });
      return { resetToken: response.resetToken };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      console.error('[AppStore] Password reset request failed', { error: errorMessage });
      throw error;
    }
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    try {
      console.debug('[AppStore] Resetting password with token');
      await resetPasswordApi(resetToken, newPassword);
      console.info('[AppStore] Password reset successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      console.error('[AppStore] Password reset failed', { error: errorMessage });
      throw error;
    }
  },

  requestRegisterToken: async (email: string) => {
    try {
      console.debug('[AppStore] Requesting register token', { email });
      const response = await requestRegisterTokenApi(email);
      console.info('[AppStore] Register token email sent', { registerToken: response.registerToken });
      return { registerToken: response.registerToken };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Register token request failed';
      console.error('[AppStore] Register token request failed', { error: errorMessage });
      throw error;
    }
  },

  confirmRegister: async (email: string, password: string, registerToken: string) => {
    try {
      console.debug('[AppStore] Confirming registration', { email });
      const response = await confirmRegisterApi(email, password, registerToken);
      // Web 客户端: Token 存储在 HttpOnly Cookie 中，无需手动存储

      console.info('[AppStore] Registration confirmed successfully');
      set({
        authToken: 'web-client', // 标记为 web 客户端（token 在 cookie 中）
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
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        console.debug('[AppStore] Auto-loading Plaid finance data after registration confirmation');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData();
        console.info('[AppStore] Plaid finance data auto-loaded after registration confirmation');

        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the registration if it fails
        console.warn('[AppStore] Failed to auto-load Plaid data after registration confirmation', plaidError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration confirmation failed';
      console.error('[AppStore] Registration confirmation failed', { error: errorMessage });
      throw error;
    }
  },

  hydrateFromStorage: async () => {
    try {
      console.debug('[AppStore] Hydrating from storage');
      set({ authStatus: 'loading' });

      // Only run on client-side
      if (typeof window === 'undefined') {
        set({ authStatus: 'unauthenticated', authError: null });
        return;
      }

      // Web 客户端: Token 在 HttpOnly Cookie 中，尝试直接调用 API
      console.debug('[AppStore] Web client - attempting to fetch profile from cookie');
      try {
        const response = await fetchCurrentUserProfile();

        console.info('[AppStore] Profile fetched successfully');
        set({
          authToken: 'web-client', // 标记为 web 客户端（token 在 cookie 中）
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
          aiInsights: [],
        });

        // Auto-load Plaid data from backend
        try {
          console.debug('[AppStore] Auto-loading Plaid finance data');
          const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
          await hydratePlaidFinanceData();
          console.info('[AppStore] Plaid finance data auto-loaded successfully');

          // Record asset snapshot for performance tracking
          const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
          recordAssetSnapshot();
        } catch (plaidError) {
          // Plaid data loading is optional - don't fail the login if it fails
          console.warn('[AppStore] Failed to auto-load Plaid data', plaidError);
        }
      } catch (error) {
        // No valid cookie or session
        console.info('[AppStore] No valid session found');
        set({ authStatus: 'unauthenticated', authError: null, authToken: null });
      }
    } catch (error) {
      console.warn('[AppStore] Failed to hydrate from storage', error);
      set({ authStatus: 'unauthenticated', authToken: null });
    }
  },

  // User methods
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

  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),

  setPlaidLinkToken: (plaidLinkToken) => set({ plaidLinkToken }),

  setAuthToken: (authToken) => {
    if (authToken) {
      set({ authToken, authStatus: 'authenticated' });
      return;
    }

    set({ authToken: null, authStatus: 'unauthenticated' });
  },

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

  // Plaid methods
  requestPlaidLinkToken: async () => {
    try {
      console.debug('[AppStore] Requesting Plaid link token');
      const result = await createPlaidLinkToken();
      console.debug('[AppStore] Plaid API response received', { result });

      // Handle both { link_token } and { token } response formats
      const token = result.link_token || (result as any).token;
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

      // Load the updated finance data
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData();

      // Record asset snapshot for performance tracking
      const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
      recordAssetSnapshot();

      // Clear the link token
      set({ plaidLinkToken: null });
      console.info('[AppStore] Finance data reloaded and asset snapshot recorded after Plaid exchange');
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

      // Update local state to remove the account
      const disconnectBankingAccount = useFinanceStore.getState().disconnectBankingAccount;
      await disconnectBankingAccount(accountId);

      // Reload the updated finance data
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Plaid account';
      console.error('[AppStore] Failed to disconnect Plaid account', { error: errorMessage });
      throw error;
    }
  },
}));
