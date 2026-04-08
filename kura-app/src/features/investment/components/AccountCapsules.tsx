import React from 'react';
import { ScrollView, Image, TouchableOpacity, Text } from 'react-native';

interface Account {
  id: string;
  name: string;
  logo: string;
}

interface AccountCapsulesProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string | null) => void;
  onAddAccount?: () => void;
}

export default function AccountCapsules({ accounts, selectedAccountId, onSelectAccount, onAddAccount }: AccountCapsulesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16, gap: 12 }}
    >
      <TouchableOpacity
        onPress={() => onSelectAccount(null)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          backgroundColor: selectedAccountId === null ? '#8B5CF6' : '#1A1A24',
          borderWidth: 1,
          borderColor: selectedAccountId === null ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>All</Text>
      </TouchableOpacity>

      {accounts.map((account) => (
        <TouchableOpacity
          key={account.id}
          onPress={() => onSelectAccount(account.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: selectedAccountId === account.id ? '#8B5CF6' : '#1A1A24',
            borderWidth: 1,
            borderColor: selectedAccountId === account.id ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
            gap: 8,
          }}
        >
          <Image source={{ uri: account.logo }} style={{ width: 20, height: 20, borderRadius: 10 }} resizeMode="contain" />
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>{account.name}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={onAddAccount}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: '#1A1A24',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#8B5CF6', fontSize: 16, fontWeight: '600' }}>+</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
