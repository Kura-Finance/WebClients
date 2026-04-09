import { create } from 'zustand';
import {
  setStoredAuthToken,
  clearStoredAuthToken,
  getStoredAuthToken,
  fetchCurrentUserProfile,
  updateAvatar as updateAvatarApi,
  updateDisplayName as updateDisplayNameApi,
  requestEmailChange,
  confirmEmailChange,
  loginUser,
  sendVerificationCode,
  verifyEmailAndRegister,
  resendVerificationCode,
  changePassword as changePasswordApi,
  requestPasswordReset as requestPasswordResetApi,
  resetPassword as resetPasswordApi,
  deleteAccount as deleteAccountApi,
} from '../api/authApi';
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
  disconnectPlaidAccount as disconnectPlaidAccountApi,
} from '../api/plaidApi';
import { fetchExchangeRates, isCacheValid, type ExchangeRates } from '../api/exchangeRateApi';
import { useFinanceStore } from './useFinanceStore';
import { type Currency } from '../utils/currencyFormatter';
import Logger from '../utils/Logger';

export type BaseCurrency = Currency;
export type Language = 'en' | 'zh-TW';

export interface UserProfile {
  displayName: string;
  email: string;
  avatarUrl: string;
  membershipLabel: string;
}

export interface UserPreferences {
  baseCurrency: BaseCurrency;
  language: Language;
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
  plaidLinkTokenTimestamp: number | null;
  authToken: string | null;
  authError: string | null;
  exchangeRates: ExchangeRates | null;
  isLoadingExchangeRates: boolean;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Registration flow (new)
  sendVerificationCode: (email: string) => Promise<void>;
  verifyEmailAndRegister: (email: string, password: string, verificationCode: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  
  // Password reset flow (updated)
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, verificationCode: string, newPassword: string) => Promise<void>;
  
  hydrateFromStorage: () => Promise<void>;
  
  // User methods
  setDisplayName: (displayName: string) => Promise<void>;
  requestEmailChange: (newEmail: string) => Promise<void>;
  confirmEmailChange: (verificationCode: string) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  setBaseCurrency: (currency: BaseCurrency) => void;
  setLanguage: (language: Language) => void;
  toggleLargeTransactionAlerts: () => void;
  toggleWeeklyAiSummary: () => void;
  addChatMessage: (message: AppChatMessage) => void;
  setPlaidLinkToken: (token: string | null) => void;
  setAuthToken: (token: string | null) => void;
  clearAuthSession: () => void;
  hydrateUserProfile: () => Promise<void>;
  
  // Exchange rate methods
  loadExchangeRates: () => Promise<void>;
  
  // Plaid methods
  requestPlaidLinkToken: () => Promise<string | null>;
  confirmPlaidExchange: (publicToken: string, institutionName?: string) => Promise<void>;
  disconnectPlaidAccount: (accountId: string) => Promise<void>;
}

// Demo data removed - now using real data from backend

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
    language: 'en',
    largeTransactionAlerts: false,
    weeklyAiSummary: false,
  },
  aiInsights: [],
  chatMessages: [],
  plaidLinkToken: null,
  plaidLinkTokenTimestamp: null,
  authToken: null,
  authError: null,
  exchangeRates: null,
  isLoadingExchangeRates: false,

  // Auth methods
  login: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      Logger.debug('AppStore', 'Attempting login', { email: normalizedEmail });
      set({ authStatus: 'loading', authError: null });

      const response = await loginUser(normalizedEmail, password);
      await setStoredAuthToken(response.token);

      Logger.info('AppStore', 'Login successful', { email: normalizedEmail });
      set({
        authToken: response.token,
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
          language: 'en',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        Logger.debug('AppStore', 'Auto-loading Plaid finance data after login');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData(response.token);
        Logger.info('AppStore', 'Plaid finance data auto-loaded after login');
        
        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the login if it fails
        Logger.warn('AppStore', 'Failed to auto-load Plaid data after login', plaidError);
      }

      // Load exchange rates
      try {
        await get().loadExchangeRates();
      } catch (rateError) {
        Logger.warn('AppStore', 'Failed to load exchange rates after login', rateError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      Logger.error('AppStore', 'Login failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authError: errorMessage });
      throw error;
    }
  },

  signup: async (email: string, password: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      Logger.debug('AppStore', 'Attempting signup', { email: normalizedEmail });
      set({ authStatus: 'loading', authError: null });

      const response = await verifyEmailAndRegister(normalizedEmail, password, '');
      await setStoredAuthToken(response.token);

      Logger.info('AppStore', 'Signup successful', { email: normalizedEmail });
      set({
        authToken: response.token,
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
          language: 'en',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        Logger.debug('AppStore', 'Auto-loading Plaid finance data after signup');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData(response.token);
        Logger.info('AppStore', 'Plaid finance data auto-loaded after signup');
        
        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the signup if it fails
        Logger.warn('AppStore', 'Failed to auto-load Plaid data after signup', plaidError);
      }

      // Load exchange rates
      try {
        await get().loadExchangeRates();
      } catch (rateError) {
        Logger.warn('AppStore', 'Failed to load exchange rates after signup', rateError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      Logger.error('AppStore', 'Signup failed', { error: errorMessage });
      set({ authStatus: 'unauthenticated', authError: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      Logger.info('AppStore', 'Logging out');
      await clearStoredAuthToken();
      
      // Clear all finance store data
      useFinanceStore.getState().clearPlaidFinanceData();
      useFinanceStore.getState().clearAssetHistory();
      
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
      Logger.info('AppStore', 'Logout successful');
    } catch (error) {
      Logger.error('AppStore', 'Logout failed', error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.info('AppStore', 'Deleting account');
      await deleteAccountApi(authToken);
      
      // Clear auth token and reset state
      await clearStoredAuthToken();
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
        plaidLinkTokenTimestamp: null,
        authError: null,
      });

      // Clear finance store data
      const financeStore = useFinanceStore.getState();
      financeStore.setAccounts([]);
      financeStore.setTransactions([]);
      financeStore.setInvestmentAccounts([]);
      financeStore.setInvestments([]);
      financeStore.clearAssetHistory();

      Logger.info('AppStore', 'Account deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
      Logger.error('AppStore', 'Delete account failed', { error: errorMessage });
      throw error;
    }
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Changing password');
      await changePasswordApi(authToken, oldPassword, newPassword);
      Logger.info('AppStore', 'Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      Logger.error('AppStore', 'Password change failed', { error: errorMessage });
      throw error;
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      Logger.debug('AppStore', 'Requesting password reset', { email });
      await requestPasswordResetApi(email);
      Logger.info('AppStore', 'Password reset code sent', { email });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      Logger.error('AppStore', 'Password reset request failed', { error: errorMessage });
      throw error;
    }
  },

  resetPassword: async (email: string, verificationCode: string, newPassword: string) => {
    try {
      Logger.debug('AppStore', 'Resetting password', { email });
      await resetPasswordApi(email, verificationCode, newPassword);
      Logger.info('AppStore', 'Password reset successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      Logger.error('AppStore', 'Password reset failed', { error: errorMessage });
      throw error;
    }
  },

  sendVerificationCode: async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      Logger.debug('AppStore', 'Sending verification code', { email: normalizedEmail });
      await sendVerificationCode(normalizedEmail);
      Logger.info('AppStore', 'Verification code sent', { email: normalizedEmail });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
      Logger.error('AppStore', 'Send verification code failed', { error: errorMessage });
      throw error;
    }
  },

  verifyEmailAndRegister: async (email: string, password: string, verificationCode: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      Logger.debug('AppStore', 'Verifying email and registering', { email: normalizedEmail });
      const response = await verifyEmailAndRegister(normalizedEmail, password, verificationCode);
      await setStoredAuthToken(response.token);

      Logger.info('AppStore', 'Registration verified successfully');
      set({
        authToken: response.token,
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
          language: 'en',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend
      try {
        Logger.debug('AppStore', 'Auto-loading Plaid finance data after registration');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData(response.token);
        Logger.info('AppStore', 'Plaid finance data auto-loaded after registration');
        
        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the registration if it fails
        Logger.warn('AppStore', 'Failed to auto-load Plaid data after registration', plaidError);
      }

      // Load exchange rates
      try {
        await get().loadExchangeRates();
      } catch (rateError) {
        Logger.warn('AppStore', 'Failed to load exchange rates after registration', rateError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration verification failed';
      Logger.error('AppStore', 'Registration verification failed', { error: errorMessage });
      throw error;
    }
  },

  resendVerificationCode: async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      Logger.debug('AppStore', 'Resending verification code', { email: normalizedEmail });
      await resendVerificationCode(normalizedEmail);
      Logger.info('AppStore', 'Verification code resent', { email: normalizedEmail });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code';
      Logger.error('AppStore', 'Resend verification code failed', { error: errorMessage });
      throw error;
    }
  },

  hydrateFromStorage: async () => {
    try {
      Logger.debug('AppStore', 'Hydrating from storage');
      set({ authStatus: 'loading' });

      const storedToken = await getStoredAuthToken();
      if (!storedToken) {
        Logger.info('AppStore', 'No stored token found');
        set({ authStatus: 'unauthenticated', authError: null });
        return;
      }

      Logger.debug('AppStore', 'Found stored token, fetching profile');
      const response = await fetchCurrentUserProfile(storedToken);

      Logger.info('AppStore', 'Profile fetched successfully');
      set({
        authToken: storedToken,
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
          language: 'en',
          largeTransactionAlerts: false,
          weeklyAiSummary: false,
        },
        aiInsights: [],
      });

      // Auto-load Plaid data from backend if Access Token was previously saved
      try {
        Logger.debug('AppStore', 'Auto-loading Plaid finance data');
        const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
        await hydratePlaidFinanceData(storedToken);
        Logger.info('AppStore', 'Plaid finance data auto-loaded successfully');
        
        // Record asset snapshot for performance tracking
        const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
        recordAssetSnapshot();
      } catch (plaidError) {
        // Plaid data loading is optional - don't fail the login if it fails
        Logger.warn('AppStore', 'Failed to auto-load Plaid data', plaidError);
      }

      // Load exchange rates
      try {
        await get().loadExchangeRates();
      } catch (rateError) {
        Logger.warn('AppStore', 'Failed to load exchange rates during hydration', rateError);
      }
    } catch (error) {
      Logger.warn('AppStore', 'Failed to hydrate from storage', error);
      await clearStoredAuthToken();
      set({ authStatus: 'unauthenticated', authToken: null });
    }
  },
  setDisplayName: async (displayName) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Updating display name', { displayName });
      const response = await updateDisplayNameApi(authToken, displayName);
      
      if (!response || !response.user || !response.user.displayName) {
        Logger.warn('AppStore', 'Display name API response missing expected structure', { response });
        throw new Error('Invalid response from display name update endpoint');
      }

      Logger.info('AppStore', 'Display name updated successfully', { displayName: response.user.displayName });
      
      set((state) => ({
        userProfile: {
          ...state.userProfile,
          displayName: response.user.displayName,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update display name';
      Logger.error('AppStore', 'Failed to update display name', { error: errorMessage });
      throw error;
    }
  },
  requestEmailChange: async (newEmail: string) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Requesting email change', { newEmail });
      await requestEmailChange(authToken, newEmail);
      Logger.info('AppStore', 'Email change requested, verification code sent');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request email change';
      Logger.error('AppStore', 'Email change request failed', { error: errorMessage });
      throw error;
    }
  },

  confirmEmailChange: async (verificationCode: string) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Confirming email change');
      const response = await confirmEmailChange(authToken, verificationCode);
      
      if (!response || !response.user || !response.user.email) {
        Logger.warn('AppStore', 'Email change API response missing expected structure', { response });
        throw new Error('Invalid response from email change confirmation endpoint');
      }

      Logger.info('AppStore', 'Email changed successfully', { newEmail: response.user.email });
      
      set((state) => ({
        userProfile: {
          ...state.userProfile,
          email: response.user.email,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm email change';
      Logger.error('AppStore', 'Email change confirmation failed', { error: errorMessage });
      throw error;
    }
  },
  updateAvatar: async (avatarUrl) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Updating avatar', { avatarUrl: avatarUrl.substring(0, 50) + '...' });
      const response = await updateAvatarApi(authToken, avatarUrl);
      
      if (!response || !response.user || !response.user.avatarUrl) {
        Logger.warn('AppStore', 'Avatar API response missing expected structure', { response });
        throw new Error('Invalid response from avatar upload endpoint');
      }

      Logger.info('AppStore', 'Avatar updated successfully', { newAvatarUrl: response.user.avatarUrl.substring(0, 50) + '...' });
      
      set((state) => ({
        userProfile: {
          ...state.userProfile,
          avatarUrl: response.user.avatarUrl,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update avatar';
      Logger.error('AppStore', 'Failed to update avatar', { error: errorMessage });
      throw error;
    }
  },
  setBaseCurrency: (baseCurrency) => set((state) => ({ preferences: { ...state.preferences, baseCurrency } })),
  setLanguage: (language) => set((state) => ({ preferences: { ...state.preferences, language } })),
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
    const authToken = get().authToken;

    if (!authToken) {
      set({ authStatus: 'unauthenticated' });
      return;
    }

    try {
      const response = await fetchCurrentUserProfile(authToken);
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
      Logger.error('AppStore', 'Failed to hydrate user profile', error);
      set({ authStatus: 'unauthenticated' });
    }
  },

  loadExchangeRates: async () => {
    try {
      const state = get();
      
      // Skip if already loading
      if (state.isLoadingExchangeRates) {
        return;
      }

      // Skip if cached rates are still valid
      if (state.exchangeRates && isCacheValid(state.exchangeRates.lastUpdated)) {
        Logger.debug('AppStore', 'Using cached exchange rates');
        return;
      }

      Logger.debug('AppStore', 'Loading exchange rates');
      set({ isLoadingExchangeRates: true });

      const rates = await fetchExchangeRates();
      set({ exchangeRates: rates, isLoadingExchangeRates: false });

      Logger.info('AppStore', 'Exchange rates loaded successfully', {
        USD: rates.USD,
        EUR: rates.EUR,
        TWD: rates.TWD,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load exchange rates';
      Logger.error('AppStore', 'Failed to load exchange rates', { error: errorMessage });
      set({ isLoadingExchangeRates: false });
    }
  },

  requestPlaidLinkToken: async () => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        Logger.warn('AppStore', 'Cannot request Plaid link token: not authenticated');
        return null;
      }

      Logger.debug('AppStore', 'Requesting Plaid link token');
      const result = await createPlaidLinkToken(authToken);
      Logger.debug('AppStore', 'Plaid API response received', { result });
      
      // Handle both { link_token } and { token } response formats
      const token = result.link_token || (result as any).token;
      if (!token) {
        Logger.error('AppStore', 'No link token in response', { result });
        throw new Error('No link token returned from backend');
      }
      
      // 保存 token 和生成时间戳（用于检测过期）
      const now = Date.now();
      set({ plaidLinkToken: token, plaidLinkTokenTimestamp: now });
      Logger.info('AppStore', 'Plaid link token received', { token: token.substring(0, 20) + '...', timestamp: new Date(now).toISOString() });
      return token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get Plaid link token';
      Logger.error('AppStore', 'Failed to request Plaid link token', { error: errorMessage });
      throw error;
    }
  },

  confirmPlaidExchange: async (publicToken: string, institutionName?: string) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Exchanging Plaid public token', {
        institution: institutionName,
      });

      const result = await exchangePlaidPublicToken(authToken, {
        public_token: publicToken,
        institution_name: institutionName,
      });

      Logger.info('AppStore', 'Plaid token exchanged successfully', { result });

      // Load the updated finance data
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData(authToken);

      // Record asset snapshot for performance tracking
      const recordAssetSnapshot = useFinanceStore.getState().recordAssetSnapshot;
      recordAssetSnapshot();

      // Clear the link token and timestamp
      set({ plaidLinkToken: null, plaidLinkTokenTimestamp: null });
      Logger.info('AppStore', 'Finance data reloaded and asset snapshot recorded after Plaid exchange');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to exchange Plaid token';
      Logger.error('AppStore', 'Plaid exchange failed', { error: errorMessage });
      throw error;
    }
  },

  disconnectPlaidAccount: async (accountId: string) => {
    try {
      const authToken = get().authToken;
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      Logger.debug('AppStore', 'Disconnecting Plaid account', { accountId });

      const result = await disconnectPlaidAccountApi(authToken, accountId);
      Logger.info('AppStore', 'Plaid account disconnected successfully', { result });

      // Update local state to remove the account
      const disconnectBankingAccount = useFinanceStore.getState().disconnectBankingAccount;
      await disconnectBankingAccount(accountId);

      // Reload the updated finance data
      const hydratePlaidFinanceData = useFinanceStore.getState().hydratePlaidFinanceData;
      await hydratePlaidFinanceData(authToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Plaid account';
      Logger.error('AppStore', 'Failed to disconnect Plaid account', { error: errorMessage });
      throw error;
    }
  },
}));
