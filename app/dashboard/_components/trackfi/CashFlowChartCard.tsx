"use client";

import React, { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/dashboard/PageShell";
import { useAppStore } from "@/store/useAppStore";
import {
  buildCashFlowChartData,
  formatAssetAmount,
  getSegmentSummary,
} from "./assetHistoryUtils";
import { useTrackFiAssetHistory } from "./useTrackFiAssetHistory";

interface CashFlowChartCardProps {
  totalBalance: number;
  accountCount: number;
  onConnect?: () => void;
  days?: number;
}

export default function CashFlowChartCard({
  totalBalance,
  accountCount,
  onConnect,
  days = 7,
}: CashFlowChartCardProps) {
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);
  const { apiAssetHistory, assetHistorySummary, isLoadingAssetHistory } = useTrackFiAssetHistory(30);

  const chartData = useMemo(
    () => buildCashFlowChartData(apiAssetHistory, days),
    [apiAssetHistory, days],
  );

  const changePercent = getSegmentSummary(assetHistorySummary, "cashFlow")?.changePercent ?? null;
  const changePositive = changePercent !== null && changePercent >= 0;

  return (
    <Panel padding="md" className="mb-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Cash flow
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
            <p className="text-3xl font-semibold tracking-tight tabular-nums text-[var(--kura-text)]">
              {formatAssetAmount(totalBalance, isBalanceHidden)}
            </p>
            {changePercent !== null ? (
              <Badge variant={changePositive ? "success" : "destructive"}>
                {changePositive ? "+" : ""}
                {changePercent.toFixed(2)}%
                <span className="ml-1 opacity-70">30d</span>
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[var(--kura-text-secondary)]">
            {accountCount} linked bank account{accountCount === 1 ? "" : "s"}
          </p>
        </div>
        {onConnect ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={onConnect}>
            Connect
          </Button>
        ) : null}
      </div>

      <div className="h-56">
        {isLoadingAssetHistory ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" stroke="var(--kura-text-secondary)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--kura-text-secondary)" width={40} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--kura-surface)",
                  border: "1px solid var(--kura-border)",
                  borderRadius: "10px",
                }}
                labelFormatter={(_, payload) => {
                  const rawTimestamp = payload?.[0]?.payload?.timestamp as string | undefined;
                  if (!rawTimestamp) return "";
                  return `${new Date(rawTimestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  })} UTC`;
                }}
                formatter={(value) => [
                  formatAssetAmount(Number(value ?? 0), isBalanceHidden),
                  "Cash flow",
                ]}
                labelStyle={{ color: "var(--kura-text-secondary)", fontSize: "11px" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--kura-primary)"
                strokeWidth={2}
                fill="transparent"
                dot={false}
                activeDot={{ r: 3, fill: "var(--kura-primary)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--kura-border)] px-4 text-center">
            <p className="text-sm text-[var(--kura-text-secondary)]">
              Connect a bank account to see cash flow history.
            </p>
            {onConnect ? (
              <Button size="sm" className="mt-3 rounded-full" onClick={onConnect}>
                Connect account
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Panel>
  );
}
