import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import AccountsList from '../components/AccountsList';
import ActivityContainer from '../components/ActivityContainer';
import TransactionsDetailModal from '../components/TransactionsDetailModal';
import { useInitializePlaidData } from '../../../shared/hooks/useInitializePlaidData';
import { useRefreshDashboardData } from '../hooks/useRefreshDashboardData';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  // State Management - UI control
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [showTransactionsDetail, setShowTransactionsDetail] = useState(false);

  // Data Management - from Zustand stores
  const accounts = useFinanceStore((state) => state.accounts);
  const transactions = useFinanceStore((state) => state.transactions);
  const isAiOptedIn = useFinanceStore((state) => state.isAiOptedIn);

  // Data Refresh - custom hooks handling all logic
  useInitializePlaidData(); // Load data on first mount
  const { refreshing, handleRefresh } = useRefreshDashboardData(); // Pull-to-refresh

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => {
      return account.type === 'credit' ? sum - account.balance : sum + account.balance;
    }, 0);
  }, [accounts]);

  const selectedAccount = selectedAccountId === 'all'
    ? { id: 'all', type: 'all' as const, name: t('dashboard.allAccounts') }
    : accounts.find((account) => account.id === selectedAccountId);

  const transactionHeader = selectedAccount?.type === 'all'
    ? t('dashboard.recentTransactions')
    : selectedAccount?.type === 'credit'
      ? t('dashboard.transactionHistory')
      : selectedAccount?.type === 'saving'
        ? t('dashboard.savingsTransactions')
        : t('dashboard.transferRecords');

  const displayTransactions = useMemo(() => {
    if (selectedAccountId === 'all') {
      return transactions;
    }

    return transactions.filter((transaction) => transaction.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      {/* 帳戶卡片容器 + 交易容器 包裹 */}
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        <View style={{ marginTop: 40 }}>
          <AccountsList 
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            onSelectAccount={setSelectedAccountId}
            totalBalance={totalBalance}
          />
        </View>
        
        {/* 交易容器 - 在 ScrollView 內部，可跟隨滾動 */}
        <View style={{ marginTop: 32 }}>
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
          onPress={() => navigation.navigate('Budget')}
          style={{
            marginHorizontal: 24,
            marginTop: 16,
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
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 }}>{t('dashboard.budget')}</Text>
            <Text style={{ fontSize: 11, fontWeight: '500', color: '#999999', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('dashboard.manageSpending')}</Text>
          </View>
          <Text style={{ fontSize: 24, color: '#8B5CF6' }}>→</Text>
        </TouchableOpacity>

        {/* 為 TabNavigator 留空白 */}
        <View style={{ height: 100 }} />
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
