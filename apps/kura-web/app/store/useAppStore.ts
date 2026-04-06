import { create } from 'zustand';
import { clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken } from '@/lib/backendApi';

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
  userProfile: UserProfile;
  preferences: UserPreferences;
  aiInsights: AiInsight[];
  chatMessages: AppChatMessage[];
  plaidLinkToken: string | null;
  authToken: string | null;

  setDisplayName: (displayName: string) => void;
  setBaseCurrency: (currency: BaseCurrency) => void;
  toggleLargeTransactionAlerts: () => void;
  toggleWeeklyAiSummary: () => void;
  addChatMessage: (message: AppChatMessage) => void;
  setPlaidLinkToken: (token: string | null) => void;
  setUserEmail: (email: string) => void;
  setAuthToken: (token: string | null) => void;
  clearAuthSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userProfile: {
    displayName: 'Rick Weng',
    email: 'rick@kura.finance',
    avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rick&backgroundColor=e2e8f0',
    membershipLabel: 'Kura Pro Member',
  },
  preferences: {
    baseCurrency: 'USD',
    largeTransactionAlerts: true,
    weeklyAiSummary: true,
  },
  aiInsights: [
    {
      id: 'spending-alert',
      title: 'Spending Alert',
      content:
        'You spent $169.50 on Dining this week, which is 15% higher than your usual average.',
    },
    {
      id: 'optimization',
      title: 'Optimization',
      content:
        'Consider moving $2,000 from your BofA Checking to Marcus Savings to earn an extra ~$8.50 this month in interest.',
    },
  ],
  chatMessages: [
    {
      id: 'msg-1',
      role: 'ai',
      content:
        'Hi! I noticed your dining expenses are up this week. Do you want me to analyze your recent Uber Eats orders?',
    },
  ],
  plaidLinkToken: null,
  authToken: getStoredAuthToken(),

  setDisplayName: (displayName) =>
    set((state) => ({ userProfile: { ...state.userProfile, displayName } })),
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
  setUserEmail: (email) =>
    set((state) => ({ userProfile: { ...state.userProfile, email } })),
  setAuthToken: (authToken) => {
    if (authToken) {
      setStoredAuthToken(authToken);
    } else {
      clearStoredAuthToken();
    }
    set({ authToken });
  },
  clearAuthSession: () => {
    clearStoredAuthToken();
    set((state) => ({
      authToken: null,
      plaidLinkToken: null,
      userProfile: {
        ...state.userProfile,
        email: 'rick@kura.finance',
      },
    }));
  },
}));
