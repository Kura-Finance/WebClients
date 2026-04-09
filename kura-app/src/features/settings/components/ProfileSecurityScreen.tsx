import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';
import EditDisplayNameScreen from './EditDisplayNameScreen';
import EditEmailScreen from './EditEmailScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import { DeleteAccountConfirmModal } from '../../../components/DeleteAccountConfirmModal';

interface ProfileSecurityScreenProps {
  onClose: () => void;
}

export default function ProfileSecurityScreen({ onClose }: ProfileSecurityScreenProps) {
  const [showEditDisplay, setShowEditDisplay] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const userProfile = useAppStore((state) => state.userProfile);
  const logout = useAppStore((state) => state.logout);

  if (showEditDisplay) {
    return <EditDisplayNameScreen onClose={() => setShowEditDisplay(false)} />;
  }

  if (showEditEmail) {
    return <EditEmailScreen onClose={() => setShowEditEmail(false)} />;
  }

  if (showResetPassword) {
    return <ResetPasswordScreen onClose={() => setShowResetPassword(false)} />;
  }

  const handleDeleteSuccess = async () => {
    try {
      await logout();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to logout after account deletion');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Profile & Security</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Personal Information</Text>
        
        <TouchableOpacity
          onPress={() => setShowEditDisplay(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Display Name</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>{userProfile.displayName || 'Not set'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowEditEmail(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Email Address</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>{userProfile.email || 'Not set'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Security Settings */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Security Settings</Text>

        <TouchableOpacity
          onPress={() => setShowResetPassword(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
        >
          <View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Reset Password</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>Reset your password securely</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Two-Factor Authentication</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>Enhance account security</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 32, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Active Sessions</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>Manage your logged in devices</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Danger Zone */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Danger Zone</Text>

        <TouchableOpacity 
          onPress={() => setShowDeleteConfirm(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <View>
            <Text style={{ color: '#EF4444', fontWeight: '500' }}>Delete Account</Text>
            <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>Permanently delete your account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>

      <DeleteAccountConfirmModal
        visible={showDeleteConfirm}
        onDismiss={() => setShowDeleteConfirm(false)}
        onSuccess={handleDeleteSuccess}
      />
    </View>
  );
}
