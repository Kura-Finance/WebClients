import React from 'react';
import { View, Text, Switch } from 'react-native';

interface PreferenceToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export default function PreferenceToggle({ label, description, value, onValueChange }: PreferenceToggleProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}>
      <View>
        <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>{label}</Text>
        <Text style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2A2A36', true: '#8B5CF6' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
