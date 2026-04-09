/**
 * ExchangeLinkModal - Modal for connecting crypto exchange accounts
 * Collects API credentials and sends to backend for CCXT processing
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logger from '../utils/Logger';
import { useAppStore } from '../store/useAppStore';
import { useFinanceStore } from '../store/useFinanceStore';
import {
  connectExchangeAccount,
  getSupportedExchanges,
  ExchangeCredentials,
  SupportedExchange,
} from '../api/exchangeApi';

interface ExchangeLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExchangeLinkModal({
  isOpen,
  onClose,
  onSuccess,
}: ExchangeLinkModalProps) {
  const { authToken } = useAppStore();
  const { addExchangeAccount, fetchExchangeBalances } = useFinanceStore();

  const [step, setStep] = useState<'select' | 'credentials'>('select');
  const [supportedExchanges, setSupportedExchanges] = useState<SupportedExchange[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<SupportedExchange | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch supported exchanges on mount
  useEffect(() => {
    const loadSupportedExchanges = async () => {
      try {
        setIsLoadingExchanges(true);
        Logger.debug('ExchangeLinkModal', 'Loading supported exchanges');
        
        // Pass authToken if available (convert null to undefined)
        const exchanges = await getSupportedExchanges(authToken ?? undefined);
        setSupportedExchanges(exchanges);
        
        Logger.info('ExchangeLinkModal', 'Supported exchanges loaded', {
          count: exchanges.length,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load exchanges';
        Logger.error('ExchangeLinkModal', 'Failed to load supported exchanges', {
          error: errorMsg,
        });
        Alert.alert('Error', 'Failed to load supported exchanges');
      } finally {
        setIsLoadingExchanges(false);
      }
    };

    if (isOpen) {
      loadSupportedExchanges();
    }
  }, [isOpen, authToken]);

  const handleSelectExchange = (exchange: SupportedExchange) => {
    setSelectedExchange(exchange);
    setAccountName(`${exchange.name} Account`);
    setApiKey('');
    setApiSecret('');
    setPassphrase('');
    setError(null);
    setStep('credentials');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedExchange(null);
    setApiKey('');
    setApiSecret('');
    setPassphrase('');
    setAccountName('');
    setError(null);
  };

  const handleValidateAndConnect = async () => {
    if (!selectedExchange || !authToken) {
      setError(authToken ? 'Missing exchange information' : 'Please log in to connect an exchange');
      return;
    }

    if (!apiKey.trim() || !apiSecret.trim()) {
      setError('API Key and Secret are required');
      return;
    }

    if (selectedExchange.requiresPassphrase && !passphrase.trim()) {
      setError('Passphrase is required for this exchange');
      return;
    }

    if (!accountName.trim()) {
      setError('Account name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const credentials: ExchangeCredentials = {
        exchange: selectedExchange.id,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        passphrase: passphrase.trim() || undefined,
      };

      // Connect account - backend will validate and use CCXT
      Logger.debug('ExchangeLinkModal', 'Connecting exchange account', {
        exchange: selectedExchange.id,
      });

      const connectedAccount = await connectExchangeAccount(credentials, authToken);

      // Add to store with display name
      addExchangeAccount({
        id: connectedAccount.id,
        exchange: connectedAccount.exchange,
        accountName: accountName,
        createdAt: connectedAccount.createdAt,
        lastSyncedAt: connectedAccount.lastSyncedAt,
        userId: connectedAccount.userId,
      });

      // Attempt to fetch initial balances
      try {
        await fetchExchangeBalances(connectedAccount.id, authToken);
      } catch (balanceErr) {
        Logger.error('ExchangeLinkModal', 'Failed to fetch initial balances', {
          error: balanceErr,
        });
        // Don't fail - account is connected, just couldn't load balances yet
      }

      Logger.info('ExchangeLinkModal', 'Exchange account connected successfully', {
        exchange: selectedExchange.id,
      });

      Alert.alert('Success', `Connected to ${selectedExchange.name}!`);

      // Reset and close
      setStep('select');
      setSelectedExchange(null);
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
      setAccountName('');
      setError(null);
      setIsLoading(false);

      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect exchange';
      Logger.error('ExchangeLinkModal', 'Connection failed', { error: errorMsg });
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setStep('select');
    setSelectedExchange(null);
    setApiKey('');
    setApiSecret('');
    setPassphrase('');
    setAccountName('');
    setError(null);
    setIsLoading(false);
    // supportedExchanges state persists for next open
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      onDismiss={() => {
        Keyboard.dismiss();
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            justifyContent: 'flex-end',
          }}
        >
          {/* Modal Content */}
          <View
            style={{
              backgroundColor: '#0B0B0F',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 24,
              paddingHorizontal: 24,
              paddingBottom: 32,
              maxHeight: '90%',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              {step === 'credentials' && (
                <TouchableOpacity onPress={handleBack}>
                  <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {step === 'select' && <View style={{ width: 24 }} />}

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {step === 'select' ? 'Select Exchange' : 'Enter Credentials'}
              </Text>

              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {step === 'select' && (
                <View style={{ gap: 12 }}>
                  {isLoadingExchanges ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <ActivityIndicator color="#8B5CF6" size="large" />
                      <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
                        Loading exchanges...
                      </Text>
                    </View>
                  ) : supportedExchanges.length > 0 ? (
                    supportedExchanges.map(exchange => (
                      <TouchableOpacity
                        key={exchange.id}
                        onPress={() => handleSelectExchange(exchange)}
                        style={{
                          padding: 16,
                          borderRadius: 16,
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.05)',
                          backgroundColor: '#1A1A24',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 16,
                        }}
                      >
                        {/* Exchange Logo */}
                        <View
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {exchange.logo && exchange.logo.startsWith('http') ? (
                            <Text style={{ fontSize: 24 }}>🏛️</Text>
                          ) : (
                            <Text style={{ fontSize: 24 }}>💱</Text>
                          )}
                        </View>

                        {/* Exchange Name */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: '600',
                              color: '#FFFFFF',
                            }}
                          >
                            {exchange.name}
                          </Text>
                        </View>

                        {/* Chevron */}
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <Ionicons name="alert-circle" size={48} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
                        No exchanges available
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {step === 'credentials' && selectedExchange && (
                <View style={{ gap: 16 }}>
                  {/* Account Name */}
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#9CA3AF',
                        marginBottom: 8,
                      }}
                    >
                      ACCOUNT NAME (OPTIONAL)
                    </Text>
                    <TextInput
                      value={accountName}
                      onChangeText={setAccountName}
                      placeholder="e.g., My Trading Account"
                      placeholderTextColor="#4B5563"
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: '#FFFFFF',
                        fontSize: 14,
                      }}
                    />
                  </View>

                  {/* API Key */}
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#9CA3AF',
                        marginBottom: 8,
                      }}
                    >
                      API KEY
                    </Text>
                    <TextInput
                      value={apiKey}
                      onChangeText={setApiKey}
                      placeholder="Enter your API Key"
                      placeholderTextColor="#4B5563"
                      secureTextEntry
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: '#FFFFFF',
                        fontSize: 14,
                      }}
                    />
                  </View>

                  {/* API Secret */}
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#9CA3AF',
                        marginBottom: 8,
                      }}
                    >
                      API SECRET
                    </Text>
                    <TextInput
                      value={apiSecret}
                      onChangeText={setApiSecret}
                      placeholder="Enter your API Secret"
                      placeholderTextColor="#4B5563"
                      secureTextEntry
                      style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: '#FFFFFF',
                        fontSize: 14,
                      }}
                    />
                  </View>

                  {/* Passphrase (if required) */}
                  {selectedExchange.requiresPassphrase && (
                    <View>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#9CA3AF',
                          marginBottom: 8,
                        }}
                      >
                        PASSPHRASE
                      </Text>
                      <TextInput
                        value={passphrase}
                        onChangeText={setPassphrase}
                        placeholder="Enter your Passphrase"
                        placeholderTextColor="#4B5563"
                        secureTextEntry
                        style={{
                          borderWidth: 1,
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 12,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          color: '#FFFFFF',
                          fontSize: 14,
                        }}
                      />
                    </View>
                  )}

                  {/* Error Message */}
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

                  {/* Security Notice */}
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#93C5FD',
                        lineHeight: 16,
                      }}
                    >
                      🔒 Your API credentials are encrypted and stored securely on our servers. We never have access to your funds - only read-only permissions.
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Buttons */}
            {step === 'credentials' && (
              <View style={{ gap: 12, marginTop: 20 }}>
                <TouchableOpacity
                  onPress={handleValidateAndConnect}
                  disabled={isLoading}
                  style={{
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: '#8B5CF6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#FFFFFF',
                      }}
                    >
                      Connect {selectedExchange?.name}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleBack}
                  disabled={isLoading}
                  style={{
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#9CA3AF',
                    }}
                  >
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
