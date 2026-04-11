import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import HoldingCard from './HoldingCard';

interface Investment {
  id: string;
  symbol: string;
  logo: string;
  holdings: number;
  currentPrice: number;
  change24h: number;
  type: 'crypto' | 'stock' | 'etf';
  value?: number; // USD value from exchange data
}

type AssetClassFilter = 'All' | 'Stock' | 'ETF' | 'Crypto';

interface HoldingsListProps {
  investments: Investment[];
  selectedAccountId: string | null;
}

export default function HoldingsList({ investments, selectedAccountId }: HoldingsListProps) {
  const [selectedFilter, setSelectedFilter] = useState<AssetClassFilter>('All');

  // Filter investments based on selected asset class
  const filteredInvestments = investments
    .filter((inv) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Stock') return inv.type === 'stock';
      if (selectedFilter === 'ETF') return inv.type === 'etf';
      if (selectedFilter === 'Crypto') return inv.type === 'crypto';
      return true;
    })
    // Sort by total value in descending order
    .sort((a, b) => {
      const valueA = a.value ?? (a.holdings * a.currentPrice);
      const valueB = b.value ?? (b.holdings * b.currentPrice);
      return valueB - valueA;
    });
  
  // Calculate total portfolio value
  const totalValue = investments.reduce((sum, inv) => {
    const invValue = inv.value ?? (inv.holdings * inv.currentPrice);
    return sum + invValue;
  }, 0);

  const filterTabs: AssetClassFilter[] = ['All', 'Stock', 'ETF', 'Crypto'];

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
          {selectedAccountId ? `Holdings (${filteredInvestments.length})` : `All Holdings (${filteredInvestments.length})`}
        </Text>

        {/* Asset Class Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          {filterTabs.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: selectedFilter === filter ? '#8B5CF6' : 'rgba(139, 92, 246, 0.3)',
                backgroundColor: selectedFilter === filter ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
              }}
            >
              <Text
                style={{
                  color: selectedFilter === filter ? '#8B5CF6' : '#9CA3AF',
                  fontSize: 12,
                  fontWeight: selectedFilter === filter ? '600' : '500',
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredInvestments.length > 0 ? (
        <View style={{ gap: 12 }}>
          {filteredInvestments.map((investment) => (
            <HoldingCard key={investment.id} investment={investment} totalValue={totalValue} />
          ))}
        </View>
      ) : (
        <View style={{ paddingVertical: 24, alignItems: 'center', paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No holdings found</Text>
        </View>
      )}
    </View>
  );
}
