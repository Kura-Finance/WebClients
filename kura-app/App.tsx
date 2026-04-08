import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from './src/shared/store/useAppStore';
import Logger from './src/shared/utils/Logger';
import { getBackendBaseUrl } from './src/shared/api/authApi';
import Header from './src/components/Header';
import TabNavigator from './src/components/TabNavigator';
import LoginScreen from './src/features/auth/screens/LoginScreen';
import SignupScreen from './src/features/auth/screens/SignupScreen';
import ForgotPasswordScreen from './src/features/auth/screens/ForgotPasswordScreen';

// 💡 建立專屬 Kura 的深色導航主題
// 這能確保在頁面切換、或是抽屜推拉時，底色不會突然閃出白光
const KuraDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#2A2A2A', // 深灰色背景
  },
};

const Stack = createNativeStackNavigator();

function AuthNavigator() {
  const [activeScreen, setActiveScreen] = useState<'login' | 'signup' | 'forgotPassword'>('login');

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {activeScreen === 'login' && (
        <Stack.Screen
          name="Login"
          options={{ animationTypeForReplace: 'pop' }}
        >
          {() => (
            <LoginScreen
              onNavigateToSignup={() => setActiveScreen('signup')}
              onNavigateToForgotPassword={() => setActiveScreen('forgotPassword')}
            />
          )}
        </Stack.Screen>
      )}

      {activeScreen === 'signup' && (
        <Stack.Screen
          name="Signup"
          options={{ animationTypeForReplace: 'pop' }}
        >
          {() => (
            <SignupScreen
              onNavigateToLogin={() => setActiveScreen('login')}
            />
          )}
        </Stack.Screen>
      )}

      {activeScreen === 'forgotPassword' && (
        <Stack.Screen
          name="ForgotPassword"
          options={{ animationTypeForReplace: 'pop' }}
        >
          {() => (
            <ForgotPasswordScreen
              onNavigateToLogin={() => setActiveScreen('login')}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

function MainNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      {/* Header 固定在頂部 */}
      <Header />
      
      {/* TabNavigator 占據剩餘空間 */}
      <TabNavigator />
    </View>
  );
}

export default function App() {
  const authStatus = useAppStore((state) => state.authStatus);
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        Logger.debug('App', 'Starting application initialization');
        Logger.debug('App', 'Backend URL', { url: getBackendBaseUrl() });
        Logger.debug('App', 'Request diagnostics enabled');
        await hydrateFromStorage();
        Logger.info('App', 'Authentication initialized');
      } catch (error) {
        Logger.error('App', 'Failed to initialize authentication', error);
      } finally {
        setIsHydrated(true);
      }
    };

    initAuth();
  }, [hydrateFromStorage]);

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0B0B0F', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    // SafeAreaProvider 確保在有瀏海或動態島的 iPhone 上，UI 不會被切到
    <SafeAreaProvider>
      {/* NavigationContainer 是所有路由的總司令部 */}
      <NavigationContainer theme={KuraDarkTheme}>
        {/* 確保手機頂部的時間、電量等狀態列圖示是白色的 (Light Content) */}
        <StatusBar style="light" translucent={true} />

        {authStatus === 'authenticated' ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}