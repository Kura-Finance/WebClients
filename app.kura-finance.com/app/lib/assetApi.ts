/**
 * Asset History API Service
 * Fetches server-side asset history for the dashboard chart
 */

import { requestJson } from './httpClient';

// ============= Types =============

export interface AssetHistoryPoint {
  timestamp: string; // ISO 8601
  value: number;
  name: string;
  type: string;
}

export interface AssetHistorySummary {
  minValue: number;
  maxValue: number;
  change: number;
  changePercent: number;
}

export interface AssetHistoryResponse {
  userId: string;
  totalAssets: number;
  lastRecordedTime: string | null;
  history: AssetHistoryPoint[];
  summary: AssetHistorySummary;
}

// ============= Request Handler =============

async function assetRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(path, options, 'AssetAPI');
}

// ============= Public API =============

/**
 * Fetch asset history for the given number of past days.
 * 取得過去 N 天的資產歷史紀錄，用於 dashboard 折線圖
 */
export const fetchAssetHistory = (days: number = 30): Promise<AssetHistoryResponse> => {
  return assetRequest<AssetHistoryResponse>(
    `/api/assets/history?days=${days}`,
    { method: 'GET' }
  );
};
