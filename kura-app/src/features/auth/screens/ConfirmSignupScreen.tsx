import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

interface ConfirmSignupScreenProps {
  email: string;
  onNavigateToLogin?: () => void;
  onBack?: () => void;
}

export default function ConfirmSignupScreen({
  email,
  onNavigateToLogin,
  onBack,
}: ConfirmSignupScreenProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmRegister = useAppStore((state) => state.confirmRegister);

  // Log props on mount to verify they're passed correctly
  React.useEffect(() => {
    Logger.debug('ConfirmSignupScreen', 'Component mounted with props', {
      email,
      hasEmail: !!email,
    });
  }, [email]);

  const handlePasteCode = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setVerificationCode(text.trim());
        Logger.debug('ConfirmSignupScreen', 'Code pasted from clipboard');
      }
    } catch (err) {
      Logger.error('ConfirmSignupScreen', 'Failed to paste code', err);
    }
  };

  const handleConfirmSignup = async () => {
    try {
      // Validate form
      if (!email) {
        setError('Email is missing');
        return;
      }

      if (!verificationCode.trim()) {
        setError('Verification code is required');
        return;
      }

      if (!password) {
        setError('Password is required');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your password');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      setError(null);

      Logger.debug('ConfirmSignupScreen', 'Confirming signup', { email, hasVerificationCode: !!verificationCode, hasPassword: !!password });
      await confirmRegister(email, password, verificationCode.trim());

      Logger.info('ConfirmSignupScreen', 'Signup confirmed successfully');
      Alert.alert('Success', 'Your account has been created successfully. Please sign in.', [
        {
          text: 'OK',
          onPress: onNavigateToLogin,
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to confirm signup. Please try again.';
      setError(errorMessage);
      Logger.error('ConfirmSignupScreen', 'Signup confirmation failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
            {/* Header */}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={onBack}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#1A1A24',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 24,
                  alignSelf: 'flex-start',
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>
                Complete Your Account
              </Text>
              <Text style={{ fontSize: 14, color: '#999999', textAlign: 'center' }}>
                Create your password to activate your account
              </Text>
              <Text style={{ fontSize: 12, color: '#666666', marginTop: 12 }}>
                Verifying: <Text style={{ color: '#8B5CF6', fontWeight: '600' }}>{email}</Text>
              </Text>
            </View>

            {/* Verification Code Input */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#CCCCCC', fontWeight: '600' }}>
                  Verification Code
                </Text>
                <TouchableOpacity onPress={handlePasteCode} disabled={isLoading}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="clipboard-outline" size={14} color="#8B5CF6" />
                    <Text style={{ fontSize: 11, color: '#8B5CF6', fontWeight: '600' }}>Paste</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#1A1A24',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Enter verification code"
                  placeholderTextColor="#666666"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  autoCapitalize="none"
                  editable={!isLoading}
                  selectTextOnFocus={true}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 12, color: '#FCA5A5' }}>{error}</Text>
              </View>
            )}

            {/* Password Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 12, color: '#CCCCCC', fontWeight: '600', marginBottom: 8 }}>
                Password
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#1A1A24',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Create a strong password"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="password"
                  autoCapitalize="none"
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: '#666666', marginTop: 4 }}>
                At least 8 characters
              </Text>
            </View>

            {/* Confirm Password Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: '#CCCCCC', fontWeight: '600', marginBottom: 8 }}>
                Confirm Password
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#1A1A24',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#666666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  autoComplete="password"
                  autoCapitalize="none"
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleConfirmSignup}
              disabled={isLoading}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#8B5CF6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity onPress={onBack} disabled={isLoading}>
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600', textAlign: 'center' }}>
                Back to Email Verification
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
