import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import ConnectAccountModal from '../../../shared/components/ConnectAccountModal';

interface ConnectedAccountsScreenProps {
  onClose: () => void;
}

const getAccountTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'checking': 'Checking Account',
    'saving': 'Savings Account',
    'credit': 'Credit Card',
    'crypto': 'Crypto Wallet',
    'Broker': 'Brokerage',
    'Exchange': 'Exchange',
    'Web3 Wallet': 'Web3 Wallet',
  };
  return labels[type] || type;
};

const getAccountIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'checking': 'card-outline',
    'saving': 'wallet-outline',
    'credit': 'card-outline',
    'crypto': 'logo-bitcoin',
    'Broker': 'trending-up',
    'Exchange': 'swap-horizontal',
    'Web3 Wallet': 'logo-ethereum',
  };
  return icons[type] || 'wallet-outline';
};

export default function ConnectedAccountsScreen({ onClose }: ConnectedAccountsScreenProps) {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const accounts = useFinanceStore((state) => state.accounts);
  const investmentAccounts = useFinanceStore((state) => state.investmentAccounts);

  const handleDisconnect = (accountId: string) => {
    // 這裡可以調用 mutation 來移除賬戶
    console.log('Disconnect account:', accountId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConnectPlaid = async () => {
    setShowConnectModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConnectWalletConnect = async () => {
    setShowConnectModal(true);
  };

  // 合并所有账户（银行账户 + 投资账户）
  const allConnectedAccounts = [
    ...accounts.map((acc) => ({
      ...acc,
      category: 'Banking',
      typeLabel: getAccountTypeLabel(acc.type),
      icon: getAccountIcon(acc.type),
    })),
    ...investmentAccounts.map((acc) => ({
      ...acc,
      category: 'Investment',
      typeLabel: getAccountTypeLabel(acc.type),
      icon: getAccountIcon(acc.type),
    })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>Connected Accounts</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, backgroundColor: '#1A1A24', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Connected Accounts List */}
        {allConnectedAccounts.length > 0 ? (
          <View>
            {allConnectedAccounts.map((account) => (
              <View
                key={account.id}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' }}>
                    {account.logo && account.logo.startsWith('http') ? (
                      <Image source={{ uri: account.logo }} style={{ width: 32, height: 32 }} />
                    ) : (
                      <Ionicons name={account.icon as any} size={24} color="#8B5CF6" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '500', fontSize: 16 }}>{account.name}</Text>
                    <Text style={{ color: '#999999', fontSize: 12, marginTop: 4 }}>{account.typeLabel}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDisconnect(account.id)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Ionicons name="wallet-outline" size={48} color="#666666" />
            <Text style={{ color: '#999999', fontSize: 16, marginTop: 16 }}>No connected accounts</Text>
          </View>
        )}

        {/* Add Account Section */}
        <Text style={{ color: '#999999', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 32, marginBottom: 16 }}>Connect a New Account</Text>

        <TouchableOpacity
          onPress={() => setShowConnectModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A24', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.5)' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(139, 92, 246, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Ionicons name="add" size={24} color="#8B5CF6" />
            </View>
            <View>
              <Text style={{ color: '#8B5CF6', fontWeight: '500', fontSize: 16 }}>Connect Account</Text>
              <Text style={{ color: '#999999', fontSize: 12, marginTop: 4 }}>Plaid or Web3 Wallet</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
        </TouchableOpacity>

        {/* Connect Account Modal */}
        <ConnectAccountModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
        />
      </ScrollView>
    </View>
  );
}
