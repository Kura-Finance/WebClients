import { create } from 'zustand';
import {
  BackendApiError,
  clearStoredAuthToken,
  fetchCurrentUserProfile,
  getStoredAuthToken,
  setStoredAuthToken,
  updateCurrentUserProfile,
} from '@/lib/backendApi';

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

  setDisplayName: (displayName: string) => Promise<void>;
  setBaseCurrency: (currency: BaseCurrency) => void;
  toggleLargeTransactionAlerts: () => void;
  toggleWeeklyAiSummary: () => void;
  addChatMessage: (message: AppChatMessage) => void;
  setPlaidLinkToken: (token: string | null) => void;
  setAuthToken: (token: string | null) => void;
  clearAuthSession: () => void;
  hydrateUserProfile: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  authStatus: getStoredAuthToken() ? 'loading' : 'unauthenticated',
  userProfile: {
    displayName: '',
    email: '',
    avatarUrl: '',
    membershipLabel: '',
  },
  preferences: {
    baseCurrency: 'USD',
    largeTransactionAlerts: true,
    weeklyAiSummary: true,
  },
  aiInsights: [],
  chatMessages: [],
  plaidLinkToken: null,
  authToken: getStoredAuthToken(),

  setDisplayName: async (displayName) => {
    const authToken = get().authToken;
    if (!authToken) {
      return;
    }

    try {
      const response = await updateCurrentUserProfile(authToken, { displayName });
      set({ userProfile: response.user });
    } catch (error) {
      console.error('Failed to update profile', error);
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
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setPlaidLinkToken: (plaidLinkToken) => set({ plaidLinkToken }),
  setAuthToken: (authToken) => {
    if (authToken) {
      setStoredAuthToken(authToken);
      set({ authToken, authStatus: 'loading' });
    } else {
      clearStoredAuthToken();
      set({ authToken: null, authStatus: 'unauthenticated' });
    }
  },
  clearAuthSession: () => {
    clearStoredAuthToken();
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
      set({ userProfile: response.user, authStatus: 'authenticated' });
    } catch (error) {
      if (error instanceof BackendApiError && (error.status === 401 || error.status === 403)) {
        clearStoredAuthToken();
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
        }));
        return;
      }

      console.error('Failed to hydrate profile', error);
      set({ authStatus: 'unauthenticated' });
    }
  },
}));
