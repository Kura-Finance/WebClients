// apps/kura-app/src/features/settings/screens/UserSettingsModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Modal, Dimensions, TouchableWithoutFeedback, ScrollView, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import UserProfile from '../components/UserProfile';
import BaseCurrencySelector from '../components/BaseCurrencySelector';
import PreferenceToggle from '../components/PreferenceToggle';
import SectionHeader from '../components/SectionHeader';
import SettingsList from '../components/SettingsList';
import SignOutButton from '../components/SignOutButton';
import ProfileSecurityScreen from '../components/ProfileSecurityScreen';
import ConnectedAccountsScreen from '../components/ConnectedAccountsScreen';

interface UserSettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UserSettingsModal({ isVisible, onClose }: UserSettingsModalProps) {
  const [showProfileSecurity, setShowProfileSecurity] = useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
  const animationProgress = useSharedValue(0);
  const userProfile = useAppStore((state) => state.userProfile);
  const authStatus = useAppStore((state) => state.authStatus);
  const preferences = useAppStore((state) => state.preferences);
  const setBaseCurrency = useAppStore((state) => state.setBaseCurrency);
  const toggleLargeTransactionAlerts = useAppStore((state) => state.toggleLargeTransactionAlerts);
  const toggleWeeklyAiSummary = useAppStore((state) => state.toggleWeeklyAiSummary);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);

  useEffect(() => {
    if (isVisible) {
      animationProgress.value = withTiming(1, { duration: 300 });
    } else {
      animationProgress.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible, animationProgress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: animationProgress.value,
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - animationProgress.value) * SCREEN_WIDTH }],
  }));

  const handleClose = () => {
    animationProgress.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
      }
    });
  };

  const handleSignOut = () => {
    clearAuthSession();
    handleClose();
  };

  if (!isVisible && animationProgress.value === 0) return null;

  // If Profile & Security is shown, render it instead
  if (showProfileSecurity) {
    return (
      <Modal visible={isVisible} transparent animationType="none">
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }, { opacity: animationProgress.value }]} />
          </TouchableWithoutFeedback>

          <Animated.View style={[{ width: '100%', height: '100%', backgroundColor: '#0B0B0F' }, { transform: [{ translateX: (1 - animationProgress.value) * SCREEN_WIDTH }] }]}>
            <ProfileSecurityScreen onClose={() => setShowProfileSecurity(false)} />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  // If Connected Accounts is shown, render it instead
  if (showConnectedAccounts) {
    return (
      <Modal visible={isVisible} transparent animationType="none">
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }, { opacity: animationProgress.value }]} />
          </TouchableWithoutFeedback>

          <Animated.View style={[{ width: '100%', height: '100%', backgroundColor: '#0B0B0F' }, { transform: [{ translateX: (1 - animationProgress.value) * SCREEN_WIDTH }] }]}>
            <ConnectedAccountsScreen onClose={() => setShowConnectedAccounts(false)} />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start' }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }, backdropStyle]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[{ width: '100%', height: '100%', backgroundColor: '#0B0B0F' }, drawerStyle]}>
          <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Account</Text>
              <TouchableOpacity onPress={handleClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <UserProfile 
              displayName={userProfile.displayName}
              email={userProfile.email}
              membershipLabel={userProfile.membershipLabel}
            />

            <SectionHeader title="Preferences" />
            <View style={{ flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              <BaseCurrencySelector 
                selectedCurrency={preferences.baseCurrency}
                onSelectCurrency={setBaseCurrency}
              />
              <PreferenceToggle
                label="Large Transactions"
                description="Alert on spends over $500"
                value={preferences.largeTransactionAlerts}
                onValueChange={toggleLargeTransactionAlerts}
              />
              <PreferenceToggle
                label="Weekly AI Summary"
                description="Kura insights via push updates"
                value={preferences.weeklyAiSummary}
                onValueChange={toggleWeeklyAiSummary}
              />
            </View>

            <SectionHeader title="Settings" />
            <SettingsList 
              onProfileSecurityPress={() => setShowProfileSecurity(true)}
              onConnectedAccountsPress={() => setShowConnectedAccounts(true)}
            />

            {authStatus === 'authenticated' && (
              <SignOutButton onPress={handleSignOut} />
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
