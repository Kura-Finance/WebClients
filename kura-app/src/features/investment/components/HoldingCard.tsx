import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface Investment {
  id: string;
  symbol: string;
  logo: string;
  holdings: number;
  currentPrice: number;
  change24h: number;
}

interface HoldingCardProps {
  investment: Investment;
  totalValue: number;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function HoldingCard({ investment, totalValue }: HoldingCardProps) {
  const positionValue = investment.holdings * investment.currentPrice;
  const percentageOfTotal = totalValue > 0 ? (positionValue / totalValue) * 100 : 0;
  const isPositive = investment.change24h >= 0;

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#1A1A24',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' }}>
          <Image source={{ uri: investment.logo }} style={{ width: 28, height: 28 }} resizeMode="contain" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{investment.symbol}</Text>
          <Text style={{ color: '#999999', fontSize: 11, marginTop: 2 }}>{investment.holdings.toFixed(4)} units • {percentageOfTotal.toFixed(1)}%</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', fontFamily: 'monospace' }}>{formatCurrency(positionValue)}</Text>
        <Text style={{ color: isPositive ? '#4ADE80' : '#EF4444', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
          {isPositive ? '+' : ''}{investment.change24h.toFixed(2)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}
