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
import ConfirmSignupScreen from './ConfirmSignupScreen';

interface SignupScreenProps {
  onNavigateToLogin?: () => void;
  onSignupSuccess?: () => void;
}

export default function SignupScreen({ onNavigateToLogin, onSignupSuccess }: SignupScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmSignup, setShowConfirmSignup] = useState(false);

  const sendVerificationCode = useAppStore((state) => state.sendVerificationCode);

  const handleSendVerificationCode = async () => {
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

      Logger.debug('SignupScreen', 'Sending verification code', { email });
      await sendVerificationCode(email);

      setIsSubmitted(true);
      
      Alert.alert('Check Your Email', 'We sent a verification code to your email address.');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      Logger.error('SignupScreen', 'Send verification code failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirmSignup) {
    return (
      <ConfirmSignupScreen
        email={email}
        onNavigateToLogin={onNavigateToLogin}
        onBack={() => setShowConfirmSignup(false)}
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
              We sent a verification link to{'\n'}
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
              Enter the verification code in the email to complete your registration. The code will expire in 15 minutes.
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
              onPress={() => setShowConfirmSignup(true)}
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
              <Ionicons name="checkmark-outline" size={16} color="#8B5CF6" />
              <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600' }}>
                Have a token? Complete signup
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
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 24 }}>
            {/* Header */}
            <View style={{ marginBottom: 32, alignItems: 'center' }}>
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

              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#8B5CF6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 24 }}>K</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 }}>
                Kura
              </Text>
              <Text style={{ fontSize: 14, color: '#999999' }}>Create your account</Text>
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
                  textContentType="emailAddress"
                  autoComplete="email"
                  autoCapitalize="none"
                  editable={!isLoading}
                  style={{
                    flex: 1,
                    color: '#FFFFFF',
                    fontSize: 14,
                  }}
                />
              </View>
            </View>

            {/* Info Text */}
            <Text
              style={{
                fontSize: 13,
                color: '#999999',
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 20,
              }}
            >
              We&apos;ll send you a verification link. Click it to set your password and activate your account.
            </Text>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleSendVerificationCode}
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
                  Verify Email
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#CCCCCC' }}>Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateToLogin} disabled={isLoading}>
                <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '600' }}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
