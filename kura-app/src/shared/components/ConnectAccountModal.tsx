import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import AppKitWalletButton from './AppKitWalletButton';
import PlaidLinkModal from './PlaidLinkModal';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectAccountModal({
  isOpen,
  onClose,
}: ConnectAccountModalProps) {
  const [isConnecting, setIsConnecting] = useState<'plaid' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPlaidModal, setShowPlaidModal] = useState(false);

  const requestPlaidLinkToken = useAppStore((state: any) => state.requestPlaidLinkToken);
  const plaidLinkToken = useAppStore((state: any) => state.plaidLinkToken);

  const handlePlaidPress = async () => {
    try {
      setIsConnecting('plaid');
      setError(null);
      // Request link token and show modal
      await requestPlaidLinkToken();
      setShowPlaidModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize Plaid');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleClose = () => {
    setError(null);
    setIsConnecting(null);
    onClose();
  };

  const handlePlaidModalClose = () => {
    setShowPlaidModal(false);
    setIsConnecting(null);
  };

  const handlePlaidModalSuccess = () => {
    setShowPlaidModal(false);
    setIsConnecting(null);
    handleClose();
  };

  const handleWalletConnected = () => {
    handleClose();
  };

  return (
    <>
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              {/* Card */}
              <View
                style={{
                  width: '85%',
                  backgroundColor: '#0B0B0F',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <View
                  style={{
                    paddingTop: 24,
                    paddingHorizontal: 24,
                    paddingBottom: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 }}>Connect Account</Text>
                    <Text style={{ fontSize: 13, color: '#9CA3AF' }}>Select the type of account to link.</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#1A1A24',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={{ padding: 24, gap: 16 }}>
                  {error && (
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 1,
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#FCA5A5' }}>{error}</Text>
                    </View>
                  )}

                  {/* Plaid Button */}
                  <TouchableOpacity
                    onPress={handlePlaidPress}
                    disabled={isConnecting !== null}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isConnecting === 'plaid' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.05)',
                      backgroundColor: isConnecting === 'plaid' ? 'rgba(139, 92, 246, 0.1)' : '#1A1A24',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="card-outline" size={24} color="#8B5CF6" />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#8B5CF6', marginBottom: 4 }}>Plaid</Text>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 16 }}>Connect bank & brokerage accounts</Text>
                    </View>

                    {/* Spinner or Arrow */}
                    {isConnecting === 'plaid' ? (
                      <ActivityIndicator color="#8B5CF6" size="small" />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                    )}
                  </TouchableOpacity>

                  {/* AppKit Wallet Button */}
                  <View
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                      backgroundColor: '#1A1A24',
                      gap: 8,
                      opacity: 0.5,
                    }}
                  >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons name="swap-horizontal" size={24} color="#3B82F6" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3B82F6', marginBottom: 4 }}>Reown AppKit</Text>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(107, 114, 128, 0.3)', borderWidth: 1, borderColor: 'rgba(107, 114, 128, 0.5)' }}>
                            <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '600' }}>Unavailable</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 16 }}>Connect Web3 wallets</Text>
                      </View>
                    </View>

                    {/* Button */}
                    <AppKitWalletButton onConnected={handleWalletConnected} disabled={true} />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Plaid Link Modal */}
      <PlaidLinkModal
        isVisible={showPlaidModal}
        linkToken={plaidLinkToken}
        onClose={handlePlaidModalClose}
        onSuccess={handlePlaidModalSuccess}
      />
    </>
  );
}
