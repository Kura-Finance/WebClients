import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';
import PerformanceSummary from '../components/PerformanceSummary';
import WaveChart from '../components/WaveChart';
import AccountCapsules from '../components/AccountCapsules';
import HoldingsList from '../components/HoldingsList';
import ConnectAccountModal from '../../../shared/components/ConnectAccountModal';

export default function InvestmentScreen() {
  const investmentAccounts = useFinanceStore((state) => state.investmentAccounts);
  const investments = useFinanceStore((state) => state.investments);
  const selectedTimeRange = useFinanceStore((state) => state.selectedTimeRange);
  const setSelectedTimeRange = useFinanceStore((state) => state.setSelectedTimeRange);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

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
      />
    </View>
  );
}
