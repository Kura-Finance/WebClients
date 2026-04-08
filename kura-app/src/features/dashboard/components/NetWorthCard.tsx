import React from 'react';
import { View, Text } from 'react-native';

interface NetWorthCardProps {
  totalBalance: number;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function NetWorthCard({ totalBalance }: NetWorthCardProps) {
  return (
    <View className="mt-1 mb-4">
      <Text className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.3em]">Net Worth</Text>
      <Text className="text-white text-4xl font-bold mt-2">{formatCurrency(totalBalance)}</Text>
    </View>
  );
}
