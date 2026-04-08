import React from 'react';
import { View, Text } from 'react-native';

interface UserProfileProps {
  displayName: string;
  email: string;
  membershipLabel: string;
}

export default function UserProfile({ displayName, email, membershipLabel }: UserProfileProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 2, borderColor: '#1A1A24' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>{displayName.trim() ? displayName.trim().slice(0, 1).toUpperCase() : '?'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 }}>{displayName || 'Signed out'}</Text>
        <Text style={{ color: '#999999', fontSize: 14, marginTop: 2 }}>{email || 'No email available'}</Text>
        <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 8, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#A78BFA', fontSize: 12, fontFamily: 'monospace' }}>{membershipLabel || 'Kura Member'}</Text>
        </View>
      </View>
    </View>
  );
}
