import React from 'react';
import { View, Text } from 'react-native';
import { useFinanceStore, AssetSnapshot } from '../../../shared/store/useFinanceStore';

interface PerformanceSummaryProps {
  timeRange?: '1M' | '3M' | '6M' | '1Y' | 'All';
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercentage(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

interface PerformanceMetrics {
  currentTotal: number;
  previousTotal: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
  daysInRange: number;
}

function calculatePerformanceMetrics(
  timeRange: string,
  assetHistory: AssetSnapshot[],
  calculateTotalAssets: () => number
): PerformanceMetrics {
  // 获取当前总资产
  const currentTotal = calculateTotalAssets();
  
  // 根据时间范围确定天数
  let daysInRange = 30;
  switch (timeRange) {
    case '1M':
      daysInRange = 30;
      break;
    case '3M':
      daysInRange = 90;
      break;
    case '6M':
      daysInRange = 180;
      break;
    case '1Y':
      daysInRange = 365;
      break;
    case 'All':
      daysInRange = 10000; // 覆盖所有数据
      break;
  }
  
  // 获取时间范围内的快照
  const cutoffTime = Date.now() - daysInRange * 24 * 3600 * 1000;
  const snapshotsInRange = assetHistory.filter((snap) => snap.timestamp >= cutoffTime);
  
  // 获取最早的快照作为对比基准
  let previousTotal = currentTotal;
  if (snapshotsInRange.length > 0) {
    previousTotal = snapshotsInRange[0].totalAssets;
  }
  
  const change = currentTotal - previousTotal;
  const changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : 0;
  const isPositive = change >= 0;
  
  return {
    currentTotal,
    previousTotal,
    change,
    changePercent,
    isPositive,
    daysInRange,
  };
}

export default function PerformanceSummary({ 
  timeRange = '1M',
}: PerformanceSummaryProps) {
  const assetHistory = useFinanceStore((s) => s.assetHistory);
  const calculateTotalAssets = useFinanceStore((s) => s.calculateTotalAssets);
  
  // 计算性能指标
  const metrics = calculatePerformanceMetrics(timeRange, assetHistory, calculateTotalAssets);
  
  const changeColor = metrics.isPositive ? '#10B981' : '#EF4444';
  const changeIcon = metrics.isPositive ? '↑' : '↓';
  
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 24, marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#999999', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>
            Total Assets
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginTop: 8 }}>
            {formatCurrency(metrics.currentTotal)}
          </Text>
        </View>
        
        <View style={{ justifyContent: 'flex-start' }}>
          <View style={{
            backgroundColor: changeColor,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
              {changeIcon} {formatPercentage(metrics.changePercent)}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 4 }}>
              {formatCurrency(Math.abs(metrics.change))}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={{ color: '#666666', fontSize: 14, marginTop: 12 }}>
        {assetHistory.length > 0
          ? `Updated ${new Date(assetHistory[assetHistory.length - 1].timestamp).toLocaleDateString()}`
          : 'No performance data yet'}
      </Text>
    </View>
  );
}
