/**
 * Reown AppKit Wallet Connection Component
 * Currently marked as unavailable - placeholder for future implementation
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Logger from '../utils/Logger';

interface AppKitWalletButtonProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  disabled?: boolean;
}

export default function AppKitWalletButton({
  onConnected,
  onDisconnected,
  disabled = true,
}: AppKitWalletButtonProps) {
  const handlePress = () => {
    Logger.debug('AppKitWalletButton', 'Web3 wallet connection not yet available');
    Alert.alert('Coming Soon', 'Web3 wallet connection will be available in a future update.');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(107, 114, 128, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.6,
      }}
    >
      <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '600' }}>
        Coming Soon
      </Text>
    </TouchableOpacity>
  );
}
