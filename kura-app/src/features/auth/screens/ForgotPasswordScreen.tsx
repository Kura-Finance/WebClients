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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';
import ResetPasswordWithTokenScreen from './ResetPasswordWithTokenScreen';

interface ForgotPasswordScreenProps {
  onNavigateToLogin?: () => void;
  onSuccess?: () => void;
}

export default function ForgotPasswordScreen({
  onNavigateToLogin,
  onSuccess,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResetPasswordWithToken, setShowResetPasswordWithToken] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const requestPasswordReset = useAppStore((state) => state.requestPasswordReset);

  const handleRequestReset = async () => {
    try {
      // Validate form
      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }

      setIsLoading(true);
      setError(null);

      Logger.debug('ForgotPasswordScreen', 'Requesting password reset', { email });
      const result = await requestPasswordReset(email);

      setIsSubmitted(true);
      
      // If backend returned resetToken, auto-fill it for direct reset
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
      
      Alert.alert('Check Your Email', 'We sent a password reset link to your email address.');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      Logger.error('ForgotPasswordScreen', 'Password reset request failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };


  if (showResetPasswordWithToken) {
    return (
      <ResetPasswordWithTokenScreen
        initialToken={resetToken}
        onNavigateToLogin={onNavigateToLogin}
        onBack={() => setShowResetPasswordWithToken(false)}
      />
    );
  }

  if (isSubmitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success State */}
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Ionicons name="checkmark-circle" size={40} color="#22C55E" />
            </View>

            <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 }}>
              Check Your Email
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: '#CCCCCC',
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              We sent a password reset link to{'\n'}
              <Text style={{ fontWeight: '600', color: '#FFFFFF' }}>{email}</Text>
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: '#999999',
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              Click the link in the email to reset your password. The link will expire in 24 hours.
            </Text>

            {/* Actions */}
            <TouchableOpacity
              onPress={onNavigateToLogin}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#8B5CF6',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>Back to Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              style={{
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: '#1A1A24',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#8B5CF6' }}>Try Another Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowResetPasswordWithToken(true)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#8B5CF6',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Ionicons name="key-outline" size={16} color="#8B5CF6" />
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600' }}>
                Have a reset token? Reset directly
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
                onPress={onNavigateToLogin}
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
                Reset Password
              </Text>
              <Text style={{ fontSize: 14, color: '#999999', textAlign: 'center' }}>
                Enter your email address and we&apos;ll send you a link to reset your password
              </Text>
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

            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, color: '#CCCCCC', fontWeight: '600', marginBottom: 8 }}>
                Email Address
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
                <Ionicons name="mail-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="your@email.com"
                  placeholderTextColor="#666666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRequestReset}
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
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600', textAlign: 'center' }}>
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
