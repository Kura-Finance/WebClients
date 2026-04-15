import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import type { Transaction } from '../../../shared/store/useFinanceStore';
import CurrencyDisplay from '../../../shared/components/CurrencyDisplay';

interface ActivityContainerProps {
  transactions: Transaction[];
  transactionHeader: string;
  isAiOptedIn: boolean;
  onToggleAiOptIn: () => void;
  onViewAll: () => void;
}

const getAccountTypeLabel = (accountType: string | undefined): string => {
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
const getTransactionIcon = (transaction: Transaction): string => {
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
const getMerchantDisplay = (transaction: Transaction): string => {
  return transaction.enrichedMerchantName || transaction.merchant || 'Unknown';
};

// Get category display
const getCategoryLabel = (transaction: Transaction): string => {
  return transaction.personalFinanceCategory || transaction.category || 'Other';
};

export default function ActivityContainer({
  transactions,
  transactionHeader,
  isAiOptedIn,
  onToggleAiOptIn,
  onViewAll,
}: ActivityContainerProps) {
  return (
    <View style={{ borderRadius: 16, backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 20, height: 345, marginHorizontal: 24, marginBottom: 32, marginTop: 0 }}>
        <View style={{ marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>{transactionHeader}</Text>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={{ color: '#8B5CF6', fontSize: 14, fontWeight: '600' }}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8, minHeight: 280 }}
          nestedScrollEnabled={true}
        >
          <View style={{ gap: 12 }}>
            {transactions.slice(0, 4).map((transaction) => {
              const isExpense = Number(transaction.amount) < 0;

              return (
                <View key={transaction.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' }}>
                      {transaction.logo ? (
                        <Image
                          source={{ uri: transaction.logo }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                      ) : (
                        <Text>{getTransactionIcon(transaction)}</Text>
                      )}
                    </View>
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text style={{ color: '#999999', fontSize: 12 }}>{transaction.date}</Text>
                        {transaction.accountType && (
                          <>
                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#444444' }} />
                            <Text style={{ color: '#999999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {getAccountTypeLabel(transaction.accountType)}
                            </Text>
                          </>
                        )}
                        {(transaction.personalFinanceCategory || transaction.category) && (
                          <>
                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#444444' }} />
                            <Text style={{ color: '#999999', fontSize: 12 }}>
                              {getCategoryLabel(transaction)}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  <Text style={{ color: isExpense ? '#FFFFFF' : '#4ADE80', fontSize: 14, fontWeight: '500', fontFamily: 'monospace' }}>
                    {isExpense ? '-' : '+'}
                  </Text>
                  <CurrencyDisplay
                    value={Number(transaction.amount)}
                    fontSize={14}
                    color={isExpense ? '#FFFFFF' : '#4ADE80'}
                    style={{ fontFamily: 'monospace', fontWeight: '500' }}
                  />
                </View>
              );
            })}

            {transactions.length === 0 && (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <Text style={{ color: '#999999', fontSize: 14 }}>No recent activity found.</Text>
              </View>
            )}
          </View>
        </ScrollView>
    </View>
  );
}
