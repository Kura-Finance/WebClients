import React, { useEffect, useState } from 'react';
import { Modal, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { create, open, destroy } from 'react-native-plaid-link-sdk';
import { useAppStore } from '../store/useAppStore';
import Logger from '../utils/Logger';

interface PlaidLinkModalProps {
  isVisible: boolean;
  linkToken: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * PlaidLinkModal Component
 * 
 * Manages the Plaid Link authentication flow using the official SDK.
 * When visible with a valid linkToken, automatically:
 * 1. Creates a Plaid session with the link token
 * 2. Opens the native Plaid Link UI
 * 3. Handles user authorization and success/exit callbacks
 * 4. Exchanges public token for access token on success
 * 5. Loads updated financial data
 */
export default function PlaidLinkModal({ 
  isVisible, 
  linkToken,
  onClose, 
  onSuccess 
}: PlaidLinkModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPlaidExchange = useAppStore((state: any) => state.confirmPlaidExchange);

  useEffect(() => {
    if (!isVisible || !linkToken) {
      Logger.debug('PlaidLinkModal', 'useEffect skipped', {
        isVisible,
        hasLinkToken: !!linkToken,
      });
      return;
    }

    const openPlaidLinkFlow = async () => {
      try {
        setIsLoading(true);
        setError(null);

        Logger.debug('PlaidLinkModal', 'Creating Plaid Link session with token', {
          token: linkToken?.substring(0, 20) + '...',
        });

        // Step 1: Create the Plaid session
        try {
          create({
            token: linkToken,
          });
          Logger.debug('PlaidLinkModal', 'Plaid session created successfully');
        } catch (createErr: any) {
          Logger.error('PlaidLinkModal', 'Failed to create session', {
            error: createErr instanceof Error ? createErr.message : String(createErr),
          });
          throw createErr;
        }

        Logger.debug('PlaidLinkModal', 'Opening Plaid Link UI with callbacks');

        // Step 2: Open Plaid Link with callbacks
        try {
          open({
            onSuccess: (linkSuccess: any) => {
              Logger.info('PlaidLinkModal', 'Plaid Link success', {
                publicToken: linkSuccess?.publicToken?.substring(0, 20) + '...',
                institution: linkSuccess?.metadata?.institution?.name,
              });

              if (linkSuccess?.publicToken) {
                confirmPlaidExchange(
                  linkSuccess.publicToken,
                  linkSuccess.metadata?.institution?.name
                ).then(() => {
                  Logger.info('PlaidLinkModal', 'Account connected successfully');
                  onSuccess?.();
                  onClose();
                }).catch((err: any) => {
                  const errorMessage = err instanceof Error ? err.message : 'Failed to connect account';
                  setError(errorMessage);
                  Logger.error('PlaidLinkModal', 'Exchange failed after Plaid success', { error: errorMessage });
                  setIsLoading(false);
                });
              }
            },
            onExit: (linkExit: any) => {
              Logger.info('PlaidLinkModal', 'Plaid Link exited', {
                hasError: !!linkExit?.error,
                errorCode: linkExit?.error?.errorCode,
              });

              if (linkExit?.error) {
                const errorMessage = linkExit.error.displayMessage || linkExit.error.errorCode || 'Link exited with error';
                setError(errorMessage);
                Logger.error('PlaidLinkModal', 'Plaid Link error', {
                  error: errorMessage,
                  code: linkExit.error.errorCode,
                });
                setIsLoading(false);
              } else {
                Logger.info('PlaidLinkModal', 'User closed Plaid Link normally', {
                  status: linkExit?.metadata?.status,
                });
                onClose();
              }
            },
          });
          Logger.debug('PlaidLinkModal', 'open() function called successfully');
        } catch (openErr: any) {
          Logger.error('PlaidLinkModal', 'Failed to open Link UI', {
            error: openErr instanceof Error ? openErr.message : String(openErr),
          });
          throw openErr;
        }
      } catch (err: any) {
        const errorMessage = err?.message || (err instanceof Error ? err.message : 'Failed to initialize Plaid Link');
        setError(errorMessage);
        Logger.error('PlaidLinkModal', 'Fatal error in openPlaidLinkFlow', { error: errorMessage });
        setIsLoading(false);
      }
    };

    // Auto-open Plaid Link when token is available
    if (!isLoading && !error) {
      openPlaidLinkFlow();
    }

    // Cleanup: destroy session when modal closes
    return () => {
      if (!isVisible) {
        destroy().catch((err: any) => {
          Logger.warn('PlaidLinkModal', 'Failed to destroy Plaid session', {
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });
      }
    };
  }, [isVisible, linkToken, confirmPlaidExchange, onClose, onSuccess, error, isLoading]);

  return (
    <Modal visible={isVisible} transparent statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-[#0B0B0F] border border-white/10 rounded-3xl overflow-hidden w-full">
          {/* Header */}
          <View className="border-b border-white/5 p-6 flex-row justify-between items-center">
            <View>
              <Text className="text-xl font-bold text-white">Connect Bank Account</Text>
              <Text className="text-sm text-gray-400 mt-1">via Plaid</Text>
            </View>
            {!isLoading && (
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-white/10 justify-center items-center"
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View className="p-6">
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-white mt-4 text-center">
                  Initializing Plaid Link...
                </Text>
                <Text className="text-gray-400 text-xs mt-2 text-center">
                  Setting up secure connection to Plaid
                </Text>
              </View>
            ) : error ? (
              <View>
                <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                  <View className="flex-row items-start">
                    <Ionicons name="alert-circle" size={16} color="#FCA5A5" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-red-300 text-sm flex-1">{error}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-2"
                >
                  <Text className="text-white font-semibold">Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  className="border border-white/10 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="bg-[#1A1A24] rounded-xl p-4 mb-4">
                  <Text className="text-gray-300 text-sm leading-5">
                    Plaid Link will open momentarily. Follow the prompts to authorize your bank account.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  className="border border-white/10 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Info */}
          <View className="bg-[#1A1A24] px-6 py-4 border-t border-white/5">
            <View className="flex-row items-start">
              <Ionicons name="shield-checkmark" size={16} color="#8B5CF6" style={{ marginRight: 8, marginTop: 2 }} />
              <Text className="text-gray-400 text-xs flex-1">
                Your banking credentials are encrypted and secured by Plaid. We never store your passwords.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
