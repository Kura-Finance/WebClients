import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAppStore } from '../shared/store/useAppStore';
import Logger from '../shared/utils/Logger';

interface DeleteAccountConfirmModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export const DeleteAccountConfirmModal: React.FC<DeleteAccountConfirmModalProps> = ({
  visible,
  onDismiss,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const deleteAccount = useAppStore((state) => state.deleteAccount);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccount(password);
      setPassword('');
      onDismiss();
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete account';
      Logger.error('DeleteAccountConfirmModal', 'Delete account failed', { error });
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
        >
          <View
            style={{
              backgroundColor: '#0B0B0F',
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: 12,
              }}
            >
              Delete Account?
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: '#9CA3AF',
                marginBottom: 20,
                lineHeight: 20,
              }}
            >
              This action cannot be undone. All your data, accounts, and investments will be permanently deleted.
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#9CA3AF',
                  marginBottom: 8,
                }}
              >
                Confirm with your password
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  color: '#FFFFFF',
                  fontSize: 14,
                }}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#DC2626',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};;
