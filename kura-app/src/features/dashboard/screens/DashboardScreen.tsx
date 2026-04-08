import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import AccountsList from '../components/AccountsList';
import ActivityContainer from '../components/ActivityContainer';
import TransactionsDetailModal from '../components/TransactionsDetailModal';

export default function DashboardScreen() {
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const isAiOptedIn = useFinanceStore((state) => state.isAiOptedIn);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => {
      return account.type === 'credit' ? sum - account.balance : sum + account.balance;
    }, 0);
  }, [accounts]);

  const selectedAccount = selectedAccountId === 'all'
    ? { id: 'all', type: 'all' as const, name: 'All Accounts' }
    : accounts.find((account) => account.id === selectedAccountId);

  const transactionHeader = selectedAccount?.type === 'all'
    ? 'Recent Transactions'
    : selectedAccount?.type === 'credit'
      ? 'Transaction History'
      : selectedAccount?.type === 'saving'
        ? 'Savings Transactions'
        : 'Transfer Records';

  const displayTransactions = useMemo(() => {
    if (selectedAccountId === 'all') {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      {/* 帳戶卡片容器 + 交易容器 包裹 */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 30 }}>
          <AccountsList 
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            totalBalance={totalBalance}
          />
        </View>
        
        {/* 交易容器 - 在 ScrollView 內部，可跟隨滾動 */}
        <View style={{ marginTop: 40 }}>
          <ActivityContainer 
            transactions={displayTransactions}
            transactionHeader={transactionHeader}
            isAiOptedIn={isAiOptedIn}
            onToggleAiOptIn={() => {}}
            onViewAll={() => setShowTransactionsDetail(true)}
          />
        </View>

        {/* Budget 入口卡片 */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            marginHorizontal: 24,
            marginTop: 10,
            marginBottom: 32,
            paddingHorizontal: 20,
            paddingVertical: 20,
            borderRadius: 16,
            backgroundColor: '#1A1A24',
            borderWidth: 2,
            borderColor: '#1A1A24',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}>Budget</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: 0.5 }}>Manage Spending</Text>
          </View>
          <Text style={{ fontSize: 24, color: '#8B5CF6' }}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Transactions Detail Modal */}
      <TransactionsDetailModal
        isOpen={showTransactionsDetail}
        onClose={() => setShowTransactionsDetail(false)}
        account={selectedAccount}
        transactions={displayTransactions}
      />
    </View>
  );
}
