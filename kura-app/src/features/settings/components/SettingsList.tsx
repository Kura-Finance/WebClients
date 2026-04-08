import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsListProps {
  onProfileSecurityPress?: () => void;
  onConnectedAccountsPress?: () => void;
}

export default function SettingsList({ onProfileSecurityPress, onConnectedAccountsPress }: SettingsListProps) {
  return (
    <View style={{ flexDirection: 'column', gap: 8 }}>
      <TouchableOpacity 
        onPress={onProfileSecurityPress}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Profile & Security</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={onConnectedAccountsPress}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Connected Accounts</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
}
