import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import Logger from '../../../shared/utils/Logger';

interface EditEmailScreenProps {
  onClose: () => void;
}

export default function EditEmailScreen({ onClose }: EditEmailScreenProps) {
  const userProfile = useAppStore((state) => state.userProfile);
  const setEmail = useAppStore((state) => state.setEmail);
  const [email, setEmailState] = useState(userProfile.email);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (email === userProfile.email) {
      Alert.alert('Info', 'Email is the same as current email');
      return;
    }

    try {
      setIsLoading(true);
      await setEmail(email);
      Logger.info('EditEmailScreen', 'Email updated successfully');
      Alert.alert('Success', 'Email updated successfully', [
        { text: 'OK', onPress: onClose }
      ]);
    } catch (error) {
      Logger.error('EditEmailScreen', 'Failed to update email', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Edit Email</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Email Address</Text>
        
        <TextInput
          value={email}
          onChangeText={setEmailState}
          placeholder="Enter your new email"
          placeholderTextColor="#666666"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, color: '#FFFFFF', padding: 16, fontSize: 16, marginBottom: 32 }}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={{ width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: isLoading ? '#666666' : '#8B5CF6', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}
        >
          {isLoading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Saving...</Text>
            </>
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
