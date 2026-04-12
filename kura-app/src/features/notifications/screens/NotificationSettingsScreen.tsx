import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../../../shared/store/notification';
import {
  getNotificationSettings,
  updateNotificationSettings as updateNotificationSettingsApi,
} from '../../../shared/api/notificationApi';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const authToken = useAppStore((state) => state.authToken);
  const navigation = useNavigation<any>();

  const settings = useNotificationStore((state) => state.settings);
  const updateSettings = useNotificationStore((state) => state.updateSettings);

  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!authToken) return;

    try {
      const response = await getNotificationSettings(authToken);
      updateSettings(response.settings);
      setLocalSettings(response.settings);
    } catch (error) {
      Logger.error('NotificationSettings', 'Failed to load settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleToggle = async (key: keyof typeof localSettings) => {
    const newValue = !localSettings[key];
    setLocalSettings({
      ...localSettings,
      [key]: newValue,
    });

    if (!authToken) return;

    try {
      setIsSaving(true);
      await updateNotificationSettingsApi(authToken, {
        [key]: newValue,
      });
      updateSettings({
        [key]: newValue,
      });
      Logger.info('NotificationSettings', 'Setting updated', { key, value: newValue });
    } catch (error) {
      // Revert on error
      setLocalSettings({
        ...localSettings,
        [key]: !newValue,
      });
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update setting';
      Alert.alert('Error', errorMessage);
      Logger.error('NotificationSettings', 'Failed to update setting', {
        error: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingItem = (
    key: keyof typeof localSettings,
    label: string,
    description: string
  ) => (
    <View
      key={key}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ color: '#999999', fontSize: 12 }}>
          {description}
        </Text>
      </View>
      <Switch
        value={localSettings[key]}
        onValueChange={() => handleToggle(key)}
        disabled={isSaving}
        trackColor={{ false: '#333333', true: '#8B5CF6' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0B0B0F',
        paddingTop: Math.max(insets.top, 10),
      }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }}>
          Settings
        </Text>
      </View>

      {/* Settings List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Alerts */}
        {renderSettingItem(
          'enableTransactionAlerts',
          'Transaction Alerts',
          'Get notified about buy, sell, and transfer events'
        )}

        {/* Account Changes */}
        {renderSettingItem(
          'enableAccountChanges',
          'Account Changes',
          'Notifications about account updates and changes'
        )}

        {/* System Messages */}
        {renderSettingItem(
          'enableSystemMessages',
          'System Messages',
          'Important system and security notifications'
        )}

        {/* Price Alerts */}
        {renderSettingItem(
          'enablePriceAlerts',
          'Price Alerts',
          'Price movement alerts and reminders'
        )}

        {/* Push Notifications */}
        {renderSettingItem(
          'enablePushNotifications',
          'Push Notifications',
          'Receive notifications on your device'
        )}
      </ScrollView>
    </View>
  );
}
