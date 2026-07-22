import type { AssetHistoryPoint, AssetHistorySummary } from '@/lib/assetApi';

export type AssetSegmentKey = 'plaidInvestment' | 'cryptoSpot' | 'defiProtocol';

export function toSafeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function formatAssetAmount(amount: number | undefined | null, hidden: boolean): string {
  if (hidden) return '••••••';
  return `$${(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChangePercent(value: number | undefined | null): string {
  const v = value ?? 0;
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
}

function toUtcDateKey(timestamp: string): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatUtcDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function buildCashFlowChartData(apiAssetHistory: AssetHistoryPoint[], days = 7) {
  const sortedHistory = [...apiAssetHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const dailyValueByUtcDate = new Map<string, { value: number; timestamp: string }>();

  sortedHistory.forEach((point) => {
    const pointRecord = point as AssetHistoryPoint & { value?: number };
    dailyValueByUtcDate.set(toUtcDateKey(point.timestamp), {
      value: toSafeNumber(pointRecord.cashFlow ?? pointRecord.value),
      timestamp: point.timestamp,
    });
  });

  const now = new Date();
  const todayUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return Array.from({ length: days }, (_, index) => {
    const offsetFromToday = days - 1 - index;
    const day = new Date(todayUtcMidnight);
    day.setUTCDate(todayUtcMidnight.getUTCDate() - offsetFromToday);

    const dayKey = toUtcDateKey(day.toISOString());
    const existingPoint = dailyValueByUtcDate.get(dayKey);

    return {
      timestamp: existingPoint?.timestamp ?? day.toISOString(),
      label: formatUtcDayLabel(day),
      value: existingPoint?.value ?? 0,
    };
  });
}

export function buildSegmentChartData(
  apiAssetHistory: AssetHistoryPoint[],
  segment: AssetSegmentKey,
) {
  const sortedHistory = [...apiAssetHistory].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return sortedHistory.map((point) => ({
    label: new Date(point.timestamp).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
    value: toSafeNumber(point[segment]),
  }));
}

export function getLatestSegmentValue(
  apiAssetHistory: AssetHistoryPoint[],
  segment: AssetSegmentKey | 'cashFlow',
): number {
  if (apiAssetHistory.length === 0) return 0;

  const latest = [...apiAssetHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )[0];

  if (segment === 'cashFlow') {
    const record = latest as AssetHistoryPoint & { value?: number };
    return toSafeNumber(record.cashFlow ?? record.value);
  }

  return toSafeNumber(latest[segment]);
}

export function getSegmentSummary(
  summary: AssetHistorySummary | null,
  segment: AssetSegmentKey | 'cashFlow',
) {
  if (!summary) return null;
  return summary[segment];
}
