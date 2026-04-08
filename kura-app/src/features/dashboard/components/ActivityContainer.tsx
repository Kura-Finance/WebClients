import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import type { Transaction } from '../../../shared/store/useFinanceStore';

interface ActivityContainerProps {
  transactions: Transaction[];
  transactionHeader: string;
  isAiOptedIn: boolean;
  onToggleAiOptIn: () => void;
  onViewAll: () => void;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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
              const isExpense = transaction.type === 'credit' || transaction.type === 'transfer';

              return (
                <View key={transaction.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Text>{transaction.type === 'deposit' ? '💰' : transaction.type === 'transfer' ? '🔄' : '🛍️'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>{transaction.merchant}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <Text style={{ color: '#999999', fontSize: 12 }}>{transaction.date}</Text>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#444444' }} />
                        <Text style={{ color: '#999999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {transaction.accountType === 'saving' ? 'Savings' : transaction.accountType === 'checking' ? 'Checking' : transaction.accountType === 'credit' ? 'Credit' : 'Crypto'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={{ color: isExpense ? '#FFFFFF' : '#4ADE80', fontSize: 14, fontWeight: '500', fontFamily: 'monospace' }}>
                    {isExpense ? '-' : '+'}{formatCurrency(Number(transaction.amount))}
                  </Text>
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
