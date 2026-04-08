import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Circle, Stop } from 'react-native-svg';
import { useFinanceStore } from '../../../shared/store/useFinanceStore';

interface WaveChartProps {
  selectedTimeRange: '1M' | '3M' | '6M' | '1Y' | 'All';
  onTimeRangeChange: (timeRange: '1M' | '3M' | '6M' | '1Y' | 'All') => void;
}

const timeRanges = ['1M', '3M', '6M', '1Y', 'All'] as const;
const CHART_WIDTH = Dimensions.get('window').width - 48; // paddingHorizontal: 24 * 2
const CHART_HEIGHT = 160; // 修改为原来的 4/5
const CHART_PADDING = 16;

interface ChartPoint {
  x: number;
  y: number;
  value: number;
}

function getSnapshotsForTimeRange(
  assetHistory: typeof useFinanceStore.getState extends () => infer T ? (T extends { assetHistory: infer U } ? U : never) : never,
  timeRange: string
): ChartPoint[] {
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
      daysInRange = 10000;
      break;
  }

  const cutoffTime = Date.now() - daysInRange * 24 * 3600 * 1000;
  const snapshotsInRange = assetHistory.filter((snap) => snap.timestamp >= cutoffTime);

  if (snapshotsInRange.length === 0) {
    return [];
  }

  // 找到最小和最大值以进行缩放
  const minValue = Math.min(...snapshotsInRange.map((s) => s.totalAssets));
  const maxValue = Math.max(...snapshotsInRange.map((s) => s.totalAssets));
  const range = maxValue - minValue || 1;

  // 计算图表点
  const points: ChartPoint[] = snapshotsInRange.map((snapshot, index) => {
    const x = (index / (snapshotsInRange.length - 1 || 1)) * (CHART_WIDTH - CHART_PADDING * 2) + CHART_PADDING;
    const normalizedValue = (snapshot.totalAssets - minValue) / range;
    const y = CHART_HEIGHT - normalizedValue * (CHART_HEIGHT - CHART_PADDING * 2) - CHART_PADDING;

    return {
      x,
      y,
      value: snapshot.totalAssets,
    };
  });

  return points;
}

export default function WaveChart({ selectedTimeRange, onTimeRangeChange }: WaveChartProps) {
  const assetHistory = useFinanceStore((state) => state.assetHistory);

  // 根据时间范围获取数据点
  const points = useMemo(() => {
    return getSnapshotsForTimeRange(assetHistory, selectedTimeRange);
  }, [assetHistory, selectedTimeRange]);

  // 生成 SVG 路径（平滑曲线）
  const pathData = useMemo(() => {
    if (points.length < 2) {
      return '';
    }

    // 使用三次贝塞尔曲线来创建平滑的波浪线
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 计算控制点（用于贝塞尔曲线）
      const cpx1 = prev.x + (curr.x - (i > 1 ? points[i - 2].x : prev.x) / 2) / 2;
      const cpy1 = prev.y + (curr.y - (i > 1 ? points[i - 2].y : prev.y) / 2) / 2;
      const cpx2 = curr.x - (next ? (next.x - prev.x) / 2 : 0);
      const cpy2 = curr.y - (next ? (next.y - prev.y) / 2 : 0);

      path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
    }

    return path;
  }, [points]);

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
      <View style={{ height: CHART_HEIGHT, backgroundColor: '#1A1A24', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', padding: 0, overflow: 'hidden' }}>
        {/* 股票軟體風格的波浪線圖 */}
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={{ width: '100%', height: '100%' }}>
          <Defs>
            <SvgLinearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
              <Stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </SvgLinearGradient>
          </Defs>

          {/* 波浪線 */}
          {pathData && (
            <>
              <Path d={pathData} stroke="#8B5CF6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

              {/* 漸變填充區域 */}
              <Path
                d={`${pathData} L ${points[points.length - 1]?.x || 0} ${CHART_HEIGHT} L ${points[0]?.x || 0} ${CHART_HEIGHT} Z`}
                fill="url(#waveGradient)"
                opacity="0.5"
              />
            </>
          )}

          {/* 數據點 */}
          {points.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#8B5CF6"
              opacity={index === points.length - 1 ? 1 : 0.5}
            />
          ))}
        </Svg>
      </View>

      {/* 時間範圍按鈕 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4, gap: 8 }}>
        {timeRanges.map((timeRange) => (
          <TouchableOpacity
            key={timeRange}
            onPress={() => onTimeRangeChange(timeRange)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: selectedTimeRange === timeRange ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              borderWidth: 1,
              borderColor: selectedTimeRange === timeRange ? 'rgba(139, 92, 246, 0.5)' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: selectedTimeRange === timeRange ? '#8B5CF6' : '#666666', fontSize: 11, fontWeight: selectedTimeRange === timeRange ? '600' : '400' }}>
              {timeRange}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
