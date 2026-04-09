import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

interface ResetPasswordScreenProps {
  onClose: () => void;
}

export default function ResetPasswordScreen({ onClose }: ResetPasswordScreenProps) {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userProfile = useAppStore((state) => state.userProfile);
  const requestPasswordReset = useAppStore((state) => state.requestPasswordReset);
  const resetPassword = useAppStore((state) => state.resetPassword);

  const handleSendCode = async () => {
    try {
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

      Logger.debug('ResetPasswordScreen', 'Sending password reset code', { email });
      await requestPasswordReset(email);

      Logger.info('ResetPasswordScreen', 'Password reset code sent');
      Alert.alert('Code Sent', 'We sent a verification code to your email address.');
      setStep('code');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send code';
      setError(errorMessage);
      Logger.error('ResetPasswordScreen', 'Send code failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!verificationCode.trim()) {
        setError('Verification code is required');
        return;
      }

      if (!newPassword) {
        setError('New password is required');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your password');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      setError(null);

      Logger.debug('ResetPasswordScreen', 'Resetting password', { email });
      await resetPassword(email, verificationCode.trim(), newPassword);

      Logger.info('ResetPasswordScreen', 'Password reset successfully');
      Alert.alert('Success', 'Your password has been updated successfully.', [
        {
          text: 'OK',
          onPress: onClose,
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      Logger.error('ResetPasswordScreen', 'Reset password failed', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('email');
      setError(null);
    } else if (step === 'password') {
      setStep('code');
      setError(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView
        style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {step !== 'email' && (
              <TouchableOpacity onPress={handleBack}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Reset Password</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#1A1A24',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Step 1: Email */}
        {step === 'email' && (
          <>
            <Text style={{ color: '#999999', fontSize: 14, marginBottom: 24 }}>
              Enter your email address to receive a verification code. We'll send it to help you reset your password.
            </Text>

            <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>
              Email Address
            </Text>

            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(null);
              }}
              placeholder={userProfile.email || 'Enter your email'}
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              style={{
                backgroundColor: '#1A1A24',
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#FFFFFF',
                fontSize: 16,
                marginBottom: 24,
              }}
            />

            {error && (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: 12, marginBottom: 24 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSendCode}
              disabled={isLoading}
              style={{
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: isLoading ? '#6B42B0' : '#8B5CF6',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {isLoading && <ActivityIndicator color="#FFFFFF" size="small" />}
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 2: Verification Code */}
        {step === 'code' && (
          <>
            <Text style={{ color: '#999999', fontSize: 14, marginBottom: 24 }}>
              Enter the verification code we sent to {email}
            </Text>

            <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>
              Verification Code
            </Text>

            <TextInput
              value={verificationCode}
              onChangeText={(text) => {
                setVerificationCode(text.toUpperCase());
                setError(null);
              }}
              placeholder="Enter verification code"
              placeholderTextColor="#666666"
              editable={!isLoading}
              style={{
                backgroundColor: '#1A1A24',
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                color: '#FFFFFF',
                fontSize: 16,
                marginBottom: 24,
                textAlign: 'center',
                letterSpacing: 2,
                fontWeight: 'bold',
              }}
            />

            {error && (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: 12, marginBottom: 24 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setStep('password');
                setError(null);
              }}
              disabled={isLoading}
              style={{
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: '#8B5CF6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Step 3: New Password */}
        {step === 'password' && (
          <>
            <Text style={{ color: '#999999', fontSize: 14, marginBottom: 24 }}>
              Enter your new password. Make sure it's at least 8 characters long.
            </Text>

            <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>
              New Password
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1A1A24',
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                marginBottom: 24,
              }}
            >
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError(null);
                }}
                placeholder="Enter new password"
                placeholderTextColor="#666666"
                secureTextEntry={!showNewPassword}
                editable={!isLoading}
                style={{ flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 }}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>
              Confirm Password
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#1A1A24',
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                marginBottom: 24,
              }}
            >
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                placeholder="Confirm new password"
                placeholderTextColor="#666666"
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                style={{ flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: 12, marginBottom: 24 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 14 }}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              style={{
                width: '100%',
                paddingVertical: 16,
                borderRadius: 12,
                backgroundColor: isLoading ? '#6B42B0' : '#8B5CF6',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {isLoading && <ActivityIndicator color="#FFFFFF" size="small" />}
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}
