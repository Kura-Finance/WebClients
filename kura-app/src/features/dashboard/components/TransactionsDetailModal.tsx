import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Transaction } from '../../../shared/store/useFinanceStore';
import CurrencyDisplay from '../../../shared/components/CurrencyDisplay';

interface TransactionsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  transactions: Transaction[];
}

const getTransactionAccountTypeLabel = (accountType: string | undefined): string => {
  if (!accountType) return 'Account';
  switch (accountType) {
    case 'saving':
      return 'Savings';
    case 'checking':
      return 'Checking';
    case 'credit':
      return 'Credit';
    default:
      return 'Account';
  }
};

// Get transaction icon based on type and category
const getTransactionIcon = (transaction: any): string => {
  // First check transaction type
  if (transaction.type === 'deposit') return '💰';
  if (transaction.type === 'transfer') return '🔄';
  
  // Then check category for more specific icons
  const category = (transaction.personalFinanceCategory || transaction.category || '').toLowerCase();
  
  if (category.includes('food') || category.includes('restaurant') || category.includes('grocery')) return '🍔';
  if (category.includes('transport') || category.includes('gas') || category.includes('taxi') || category.includes('uber')) return '🚗';
  if (category.includes('entertainment') || category.includes('movies') || category.includes('games')) return '🎬';
  if (category.includes('shopping') || category.includes('retail')) return '🛍️';
  if (category.includes('subscription')) return '🔄';
  if (category.includes('utility') || category.includes('bill')) return '🏠';
  if (category.includes('health') || category.includes('medical') || category.includes('pharmacy')) return '⚕️';
  if (category.includes('travel') || category.includes('hotel')) return '✈️';
  
  return '🛍️'; // Default
};

// Get merchant display name (prefer enriched version)
const getMerchantDisplay = (transaction: any): string => {
  return transaction.enrichedMerchantName || transaction.merchant || 'Unknown';
};

// Get category display
const getCategoryLabel = (transaction: any): string => {
  return transaction.personalFinanceCategory || transaction.category || 'Other';
};

// Get merchant logo with priority: Plaid > Clearbit > fallback
const getMerchantLogo = (transaction: any): string | null => {
  // Priority: Plaid logo (default) > Clearbit logo > null
  return transaction.plaidMerchantLogo || transaction.merchantLogo || null;
};

// Calculate correct transaction amount with sign
// credit type = expense (negative), deposit/transfer = income or transfer (positive)
const getTransactionAmount = (transaction: any): number => {
  const amount = Number(transaction.amount);
  // Credit card transactions are expenses, show as negative
  if (transaction.type === 'credit') {
    return Math.abs(amount) * -1; // Ensure negative
  }
  // Deposit is income, show as positive
  if (transaction.type === 'deposit') {
    return Math.abs(amount); // Ensure positive
  }
  // Transfer: keep original sign
  return amount;
};

const isTransactionExpense = (transaction: any): boolean => {
  return getTransactionAmount(transaction) < 0;
};

export default function TransactionsDetailModal({ 
  isOpen, 
  onClose, 
  account, 
  transactions 
}: TransactionsDetailModalProps) {
  const insets = useSafeAreaInsets();
  const [imageErrors, setImageErrors] = React.useState<Record<string | number, boolean>>({});
  
  if (!account) return null;

  const accountType = (account as any).type;
  // Always use purple color
  const accentColors = ['#8B5CF6', '#6366F1'] as const;
  
  const handleImageError = (transactionId: string | number) => {
    setImageErrors((prev) => ({ ...prev, [transactionId]: true }));
  };

  const accountTypeLabel = accountType === 'all' 
    ? 'All Accounts' 
    : accountType === 'credit' 
      ? 'Credit Card' 
      : accountType === 'saving'
        ? 'Savings'
        : accountType === 'checking'
          ? 'Checking'
          : 'Account';

  const balance = (account as any).balance ?? 0;
  const balanceValue = accountType === 'credit' || accountType === 'all'
    ? -balance
    : balance;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: '#0B0B0F', paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Transactions</Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#1A1A24',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Account Card */}
          {accountType !== 'all' && (
            <View style={{ marginBottom: 24 }}>
              <LinearGradient
                colors={accentColors}
                style={{
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: '#1A1A24',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 5,
                }}
              >
                {/* Top Row: Account name (left) and Balance (right) */}
                <View 
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  {/* Left: Account Name */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, color: '#999999', fontWeight: '600' }} numberOfLines={1}>
                      {(account as any).name}
                    </Text>
                  </View>
                  {/* Right: Balance */}
                  <CurrencyDisplay
                    value={balanceValue}
                    fontSize={18}
                    color="#FFFFFF"
                    style={{ marginLeft: 16, fontWeight: '700' }}
                  />
                </View>

                {/* Bottom Row: Account Type */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text 
                    style={{
                      fontSize: 11,
                      color: '#999999',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: 0.28,
                    }}
                  >
                    {accountTypeLabel}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* All Accounts Header - when account type is 'all' */}
          {accountType === 'all' && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}>
                All Accounts
              </Text>
              <Text style={{ fontSize: 12, color: '#999999' }}>
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Transactions List */}
          <View style={{ gap: 12 }}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const isExpense = isTransactionExpense(transaction);
                const displayAmount = getTransactionAmount(transaction);
                const logo = getMerchantLogo(transaction);
                const hasImageError = imageErrors[transaction.id] || false;

                return (
                  <View 
                    key={transaction.id} 
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: '#1A1A24',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {/* Top row: Logo, Merchant Name, Amount */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      {/* Logo container */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#2A2A2A',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                          overflow: 'hidden',
                        }}
                      >
                        {logo && !hasImageError ? (
                          <Image
                            source={{ uri: logo }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            onError={() => handleImageError(transaction.id)}
                          />
                        ) : (
                          <Text>{getTransactionIcon(transaction)}</Text>
                        )}
                      </View>

                      {/* Merchant name container */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                            {getMerchantDisplay(transaction)}
                          </Text>
                          {transaction.isPending && (
                            <Text style={{ color: '#FFA500', fontSize: 10, fontWeight: '600' }}>⏳</Text>
                          )}
                          {transaction.isSubscription && (
                            <Text style={{ color: '#8B5CF6', fontSize: 10, fontWeight: '600' }}>🔄</Text>
                          )}
                        </View>
                      </View>

                      {/* Amount container */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 16 }}>
                        <Text
                          style={{
                            color: isExpense ? '#FFFFFF' : '#4ADE80',
                            fontSize: 14,
                            fontWeight: '500',
                            fontFamily: 'monospace',
                          }}
                        >
                          {isExpense ? '-' : '+'}
                        </Text>
                        <CurrencyDisplay
                          value={Math.abs(displayAmount)}
                          fontSize={14}
                          color={isExpense ? '#FFFFFF' : '#4ADE80'}
                          style={{ fontFamily: 'monospace', fontWeight: '500' }}
                        />
                      </View>
                    </View>

                    {/* Bottom row: Date, Category, Account Type */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                      {/* Date and Category container */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {/* Date container */}
                        <Text style={{ color: '#999999', fontSize: 12 }}>{transaction.date}</Text>

                        {/* Category container */}
                        {(transaction.personalFinanceCategory || transaction.category) && (
                          <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#8B5CF6' }}>
                            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
                              {getCategoryLabel(transaction)}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Account type container */}
                      {transaction.accountType && (
                        <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#8B5CF6' }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {getTransactionAccountTypeLabel(transaction.accountType)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <Text style={{ color: '#999999', fontSize: 14 }}>No transactions found.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              backgroundColor: '#1A1A24',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#8B5CF6', fontSize: 16, fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
