import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../../shared/store/useAppStore';

interface EditDisplayNameScreenProps {
  onClose: () => void;
}

export default function EditDisplayNameScreen({ onClose }: EditDisplayNameScreenProps) {
  const userProfile = useAppStore((state) => state.userProfile);
  const [displayName, setDisplayName] = useState(userProfile.displayName);

  const handleSave = () => {
    // 这里可以调用 mutation 来保存
    console.log('Save display name:', displayName);
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Edit Display Name</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 16 }}>Display Name</Text>
        
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Enter your display name"
          placeholderTextColor="#666666"
          style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, color: '#FFFFFF', padding: 16, fontSize: 16, marginBottom: 32 }}
        />

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={{ width: '100%', paddingVertical: 16, borderRadius: 12, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
