import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

interface VerifyEmailChangeScreenProps {
  newEmail: string;
  onClose: () => void;
  expiresIn: number; // milliseconds
}

export default function VerifyEmailChangeScreen({ newEmail, onClose, expiresIn }: VerifyEmailChangeScreenProps) {
  const confirmEmailChange = useAppStore((state) => state.confirmEmailChange);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(expiresIn / 1000)); // convert to seconds

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.trim().length < 4) {
      Alert.alert('Error', 'Verification code should be at least 4 characters');
      return;
    }

    try {
      setIsLoading(true);
      Logger.info('VerifyEmailChangeScreen', 'Confirming email change', { newEmail });
      await confirmEmailChange(verificationCode.trim());
      Logger.info('VerifyEmailChangeScreen', 'Email changed successfully');
      Alert.alert('Success', `Email changed to ${newEmail}`, [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      Logger.error('VerifyEmailChangeScreen', 'Failed to verify email change', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = timeRemaining <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView 
        style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} 
        contentContainerStyle={{ paddingBottom: 40 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Verify Email</Text>
          <TouchableOpacity 
            onPress={onClose} 
            style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text style={{ color: '#999999', fontSize: 14, marginBottom: 24, lineHeight: 20 }}>
          A verification code has been sent to {'\n'}
          <Text style={{ fontWeight: 'bold', color: '#E0E0E0' }}>{newEmail}</Text>
        </Text>

        {/* Verification Code Input */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 12 }}>
          Verification Code
        </Text>
        
        <TextInput
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="Enter verification code"
          placeholderTextColor="#666666"
          maxLength={10}
          editable={!isExpired && !isLoading}
          style={{ 
            backgroundColor: '#1A1A24', 
            borderWidth: 1, 
            borderColor: isExpired ? '#666666' : 'rgba(139, 92, 246, 0.2)', 
            borderRadius: 12, 
            color: '#FFFFFF', 
            padding: 16, 
            fontSize: 16, 
            marginBottom: 8,
            opacity: isExpired ? 0.5 : 1
          }}
        />

        {/* Timer */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#999999', fontSize: 12 }}>
            Code expires in:
          </Text>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: 'bold', 
            color: timeRemaining <= 60 ? '#FF6B6B' : '#8B5CF6'
          }}>
            {formatTime(timeRemaining)}
          </Text>
        </View>

        {isExpired && (
          <View style={{ 
            backgroundColor: 'rgba(255, 107, 107, 0.1)', 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: '#FF6B6B'
          }}>
            <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '500' }}>
              Verification code has expired. Please request a new one.
            </Text>
          </View>
        )}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={isLoading || isExpired}
          style={{ 
            width: '100%', 
            paddingVertical: 16, 
            borderRadius: 12, 
            backgroundColor: isLoading || isExpired ? '#666666' : '#8B5CF6', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexDirection: 'row', 
            gap: 8 
          }}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Verifying...</Text>
            </>
          ) : isExpired ? (
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Code Expired</Text>
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={{ color: '#666666', fontSize: 12, marginTop: 24, textAlign: 'center', lineHeight: 18 }}>
          Didn't receive the code? Check your spam folder or request a new verification code.
        </Text>
      </ScrollView>
    </View>
  );
}
