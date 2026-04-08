import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChangePasswordScreenProps {
  onClose: () => void;
}

export default function ChangePasswordScreen({ onClose }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSave = () => {
    // 这里可以调用 mutation 来保存
    console.log('Change password');
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Change Password</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Current Password</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 24 }}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#666666"
            secureTextEntry={!showCurrentPassword}
            style={{ flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
            <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>New Password</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, paddingHorizontal: 16, marginBottom: 32 }}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#666666"
            secureTextEntry={!showNewPassword}
            style={{ flex: 1, color: '#FFFFFF', paddingVertical: 16, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons name={showNewPassword ? 'eye' : 'eye-off'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={{ width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Update Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
