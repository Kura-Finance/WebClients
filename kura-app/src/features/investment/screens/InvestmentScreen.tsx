import React, { useMemo, useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import { useWeb3WalletStore } from '../../../shared/store/useWeb3WalletStore';
import { useExchangeStore } from '../../../shared/store/useExchangeStore';
import { useAppStore } from '../../../shared/store/useAppStore';
import PerformanceSummary from '../components/PerformanceSummary';
import WaveChart from '../components/WaveChart';
import AccountCapsules from '../components/AccountCapsules';
import HoldingsList from '../components/HoldingsList';
import ConnectAccountModal from '../../../shared/components/ConnectAccountModal';
import PlaidLinkModal from '../../../shared/components/PlaidLinkModal';
import ExchangeLinkModal from '../../../shared/components/ExchangeLinkModal';

export default function InvestmentScreen() {
  // Finance Store (Plaid/Broker/Exchange)
  const financeInvestmentAccounts = useFinanceStore((state) => state.investmentAccounts);
  const financeInvestments = useFinanceStore((state) => state.investments);
  const selectedTimeRange = useFinanceStore((state) => state.selectedTimeRange);
  const setSelectedTimeRange = useFinanceStore((state) => state.setSelectedTimeRange);

  // Web3 Wallet Store
  const walletAccounts = useWeb3WalletStore((state) => state.walletAccounts);
  const walletInvestments = useWeb3WalletStore((state) => state.walletInvestments);

  // Exchange Store
  const exchangeInvestmentAccounts = useExchangeStore((state) => state.exchangeInvestmentAccounts);
  const exchangeInvestments = useExchangeStore((state) => state.exchangeInvestments);

  // Combine data from all three stores
  const investmentAccounts = useMemo(
    () => [...financeInvestmentAccounts, ...walletAccounts, ...exchangeInvestmentAccounts],
    [financeInvestmentAccounts, walletAccounts, exchangeInvestmentAccounts]
  );

  const investments = useMemo(
    () => [...financeInvestments, ...walletInvestments, ...exchangeInvestments],
    [financeInvestments, walletInvestments, exchangeInvestments]
  );

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const plaidLinkToken = useAppStore((state: any) => state.plaidLinkToken);

  // Clear selected account if it no longer exists
  useEffect(() => {
    if (selectedAccountId && !investmentAccounts.find(acc => acc.id === selectedAccountId)) {
      setSelectedAccountId(null);
    }
  }, [investmentAccounts, selectedAccountId]);

  const displayedInvestments = useMemo(() => {
    if (selectedAccountId) {
      return investments.filter((investment) => investment.accountId === selectedAccountId);
    }
    return investments;
  }, [investments, selectedAccountId]);

  const handleAddAccount = () => {
    setShowConnectModal(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0F' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <PerformanceSummary timeRange={selectedTimeRange} />
        <WaveChart selectedTimeRange={selectedTimeRange} onTimeRangeChange={setSelectedTimeRange} />
        <AccountCapsules 
          accounts={investmentAccounts} 
          selectedAccountId={selectedAccountId} 
          onSelectAccount={setSelectedAccountId}
          onAddAccount={handleAddAccount}
        />
        <HoldingsList 
          investments={displayedInvestments} 
          selectedAccountId={selectedAccountId}
        />
      </ScrollView>

      {/* Connect Account Modal */}
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onPlaidPress={() => setShowPlaidModal(true)}
        onWeb3Press={() => {
          // Web3 wallet connection is handled directly by AppKit modal
          // No additional modal needed
        }}
        onExchangePress={() => setShowExchangeModal(true)}
      />

      {/* Plaid Link Modal */}
      <PlaidLinkModal
        isVisible={showPlaidModal}
        linkToken={plaidLinkToken}
        onClose={() => setShowPlaidModal(false)}
        onSuccess={() => setShowPlaidModal(false)}
      />

      {/* Exchange Link Modal */}
      <ExchangeLinkModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        onSuccess={() => {
          // Exchange account connected successfully
          // You can add additional logic here if needed
        }}
      />
    </View>
  );
}
