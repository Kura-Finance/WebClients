"use client";

import React, { useId, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/dashboard/PageShell";
import { useAppStore } from "@/store/useAppStore";
import {
  type AssetSegmentKey,
  buildSegmentChartData,
  formatAssetAmount,
  formatChangePercent,
  getLatestSegmentValue,
  getSegmentSummary,
} from "./assetHistoryUtils";
import { useTrackFiAssetHistory } from "./useTrackFiAssetHistory";

interface AssetSegmentChartCardProps {
  segment: AssetSegmentKey;
  title: string;
  description: string;
}

export default function AssetSegmentChartCard({
  segment,
  title,
  description,
}: AssetSegmentChartCardProps) {
  const gradientId = useId().replace(/:/g, "");
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const { apiAssetHistory, assetHistorySummary, isLoadingAssetHistory } = useTrackFiAssetHistory(30);

  const chartData = useMemo(
    () => buildSegmentChartData(apiAssetHistory, segment),
    [apiAssetHistory, segment],
  );

  const latestValue = useMemo(
    () => getLatestSegmentValue(apiAssetHistory, segment),
    [apiAssetHistory, segment],
  );

  const changePercent = getSegmentSummary(assetHistorySummary, segment)?.changePercent ?? 0;
  const changePositive = changePercent >= 0;

  return (
    <Panel padding="md" className="mb-6">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--kura-text)]">
            {formatAssetAmount(latestValue, isBalanceHidden)}
          </p>
          <Badge variant={changePositive ? "success" : "destructive"}>
            {isBalanceHidden ? "••••" : formatChangePercent(changePercent)}
            <span className="ml-1 opacity-70">30d</span>
          </Badge>
        </div>
        <p className="mt-1 text-xs text-[var(--kura-text-secondary)]">{description}</p>
      </div>

      <div className="h-36">
        {isLoadingAssetHistory ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--kura-primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--kura-primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                stroke="var(--kura-text-secondary)"
                tick={{ fontSize: 10 }}
                minTickGap={12}
              />
              <YAxis
                stroke="var(--kura-text-secondary)"
                tick={{ fontSize: 10 }}
                width={30}
                tickFormatter={(value) => `${Number(value).toFixed(0)}`}
                domain={["dataMin - 2", "dataMax + 2"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--kura-surface)",
                  border: "1px solid var(--kura-border)",
                  borderRadius: "10px",
                }}
                formatter={(value) => [
                  formatAssetAmount(Number(value ?? 0), isBalanceHidden),
                  title,
                ]}
                labelFormatter={(label) => String(label)}
                labelStyle={{ color: "var(--kura-text-secondary)", fontSize: "11px" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--kura-primary)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 3, fill: "var(--kura-primary)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--kura-border)] text-sm text-[var(--kura-text-secondary)]">
            No trend data yet.
          </div>
        )}
      </div>
    </Panel>
  );
}
