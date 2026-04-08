import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Transaction } from '../../../shared/store/useFinanceStore';

interface TransactionsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
  transactions: Transaction[];
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TransactionsDetailModal({ 
  isOpen, 
  onClose, 
  account, 
  transactions 
}: TransactionsDetailModalProps) {
  if (!account) return null;

  const accountType = (account as any).type;
  // Always use purple color
  const accentColors = ['#8B5CF6', '#6366F1'] as const;

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
  const balanceLabel = accountType === 'credit' || accountType === 'all'
    ? `-${formatCurrency(balance)}`
    : formatCurrency(balance);

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
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
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginLeft: 16 }}>
                    {balanceLabel}
                  </Text>
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
                const isExpense = transaction.type === 'credit' || transaction.type === 'transfer';

                return (
                  <View 
                    key={transaction.id} 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      backgroundColor: '#1A1A24',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 16 }}>
                      {/* Icon */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: '#2A2A2A',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text>{transaction.type === 'deposit' ? '💰' : transaction.type === 'transfer' ? '🔄' : '🛍️'}</Text>
                      </View>

                      {/* Merchant & Meta */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                          {transaction.merchant}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <Text style={{ color: '#999999', fontSize: 12 }}>{transaction.date}</Text>
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#444444' }} />
                          <Text style={{ color: '#999999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {transaction.accountType === 'saving'
                              ? 'Savings'
                              : transaction.accountType === 'checking'
                                ? 'Checking'
                                : transaction.accountType === 'credit'
                                  ? 'Credit'
                                  : 'Crypto'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Amount */}
                    <Text
                      style={{
                        color: isExpense ? '#FFFFFF' : '#4ADE80',
                        fontSize: 14,
                        fontWeight: '500',
                        fontFamily: 'monospace',
                      }}
                    >
                      {isExpense ? '-' : '+'}{formatCurrency(Number(transaction.amount))}
                    </Text>
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
      </SafeAreaView>
    </Modal>
  );
}
