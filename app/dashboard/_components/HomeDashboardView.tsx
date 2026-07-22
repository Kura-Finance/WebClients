"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  HandCoins,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHomeWallet } from "@/hooks/useHomeWallet";
import { useWalletActivity } from "@/hooks/useWalletActivity";
import { useHomeSummaryCards } from "@/hooks/useHomeSummaryCards";
import { HOME_STABLECOINS } from "@/lib/baseChain";
import { cryptoLogoUrl } from "@/lib/assetLogos";
import { isPrivyConfigured } from "@/config/env";
import PrivyEoaSync from "@/components/wallet/PrivyEoaSync";
import WalletHistorySection from "@/components/wallet/WalletHistorySection";
import AssetIcon from "@/components/ui/AssetIcon";
import { Button } from "@/components/ui/button";
import {
  DashboardPage,
  PageAlert,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/dashboard/PageShell";

function truncate(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatToken(value: number, digits = 4): string {
  if (value === 0) return "0.00";
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function formatUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STABLE_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  EURC: "#1E4BD2",
  DAI: "#F5AC37",
  XSGD: "#E31C23",
  AUDD: "#00843D",
  BRZ: "#009C3B",
  MXNe: "#006847",
};

export default function HomeDashboardView() {
  const isBalanceHidden = useAppStore((s) => s.isBalanceHidden);
  const displayName = useAppStore((s) => s.userProfile.displayName)?.trim();
  const email = useAppStore((s) => s.userProfile.email)?.trim();
  const firstName =
    displayName?.split(/\s+/)[0] ||
    (email ? email.split("@")[0] : null) ||
    "there";

  const wallet = useHomeWallet();
  const summary = useHomeSummaryCards();
  const { activities, loading: activityLoading, error: activityError, refresh: refreshActivity } =
    useWalletActivity(wallet.scaAddress);

  const cashRows = useMemo(() => {
    const rows = HOME_STABLECOINS.map((token) => ({
      token,
      amount: wallet.stableBalances[token.symbol] ?? 0,
    }));
    const withBalance = rows.filter((r) => r.amount > 0);
    if (withBalance.length > 0) return withBalance;
    return rows.filter((r) => r.token.symbol === "USDC");
  }, [wallet.stableBalances]);

  const refreshing = wallet.loading || summary.loading || activityLoading;

  const handleRefresh = () => {
    void wallet.refresh();
    void summary.refresh();
    void refreshActivity();
  };

  return (
    <DashboardPage>
      {isPrivyConfigured ? (
        <PrivyEoaSync onEoa={wallet.applyEoaAddress} persistedEoa={wallet.record.walletAddress} />
      ) : null}

      <PageHeader
        eyebrow="Home"
        title={`Welcome, ${firstName}`}
        description="Cash, investments, and recent activity."
        actions={
          <>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard/add-money">
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Add Money
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/payment">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Transfer
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full text-[var(--kura-text-secondary)]"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      {wallet.error ? <PageAlert variant="warning">{wallet.error}</PageAlert> : null}

      {/* Net worth + breakdown */}
      <section className="mb-6 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Link
          href="/dashboard/crypto"
          className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-6 transition-colors hover:bg-[var(--kura-bg-light)]/30"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Net Worth
          </p>
          {summary.loading ? (
            <div className="mt-3 h-10 w-48 animate-pulse rounded-lg bg-[var(--kura-bg-lighter)]" />
          ) : (
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums text-[var(--kura-text)]">
              {isBalanceHidden ? "••••••" : formatUsd(summary.netWorth)}
            </p>
          )}
          <p className="mt-2 text-xs text-[var(--kura-text-secondary)]">
            Cash · Investments · Earn − Loans
            {wallet.scaAddress ? (
              <>
                {" · "}
                <span className="font-mono">{truncate(wallet.scaAddress)}</span>
              </>
            ) : null}
          </p>
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            href="/dashboard/investment"
            label="Investment"
            value={summary.investmentUsd}
            loading={summary.loading}
            hidden={isBalanceHidden}
            icon={<Briefcase className="h-3.5 w-3.5" />}
          />
          <MetricCard
            href="/dashboard/borrow"
            label="Loan"
            value={summary.loanUsd}
            loading={summary.loading}
            hidden={isBalanceHidden}
            icon={<HandCoins className="h-3.5 w-3.5" />}
          />
          <MetricCard
            href="/dashboard/earn"
            label="Earn"
            value={summary.earnUsd}
            loading={summary.loading}
            hidden={isBalanceHidden}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
          />
        </div>
      </section>

      {/* Cash + History */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Panel padding="md">
          <PanelHeader
            title="Cash"
            description="Stablecoins on Base"
            action={
              <Link
                href="/dashboard/add-money"
                className="text-xs font-semibold text-[var(--kura-primary)] hover:underline"
              >
                Top up
              </Link>
            }
          />

          {wallet.loading || wallet.stablesLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
              ))}
            </div>
          ) : wallet.provisioning ? (
            <p className="py-6 text-center text-sm text-[var(--kura-text-secondary)]">
              Setting up your Smart Wallet…
            </p>
          ) : !wallet.scaAddress ? (
            <p className="py-6 text-center text-sm text-[var(--kura-text-secondary)]">
              Connect with Privy to create your Smart Wallet address. You can fund it before the first
              on-chain transaction.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--kura-border)]">
              {cashRows.map(({ token, amount }) => (
                <li key={token.symbol} className="flex items-center gap-3 py-3">
                  <AssetIcon
                    src={cryptoLogoUrl(token.symbol)}
                    label={token.symbol}
                    color={STABLE_COLORS[token.symbol] ?? "#64748B"}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--kura-text)]">{token.symbol}</p>
                    <p className="truncate text-[11px] text-[var(--kura-text-secondary)]">
                      {token.name}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-[var(--kura-text)]">
                    {isBalanceHidden ? "••••" : formatToken(amount, 2)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="min-w-0 [&_section]:mt-0">
          <WalletHistorySection
            activities={activities}
            loading={activityLoading}
            error={activityError}
            hidden={isBalanceHidden}
            hasWallet={!!wallet.scaAddress}
          />
        </div>
      </section>
    </DashboardPage>
  );
}

function MetricCard({
  href,
  label,
  value,
  loading,
  hidden,
  icon,
}: {
  href: string;
  label: string;
  value: number;
  loading: boolean;
  hidden: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-4 transition-colors hover:bg-[var(--kura-bg-light)]/30"
    >
      <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--kura-primary)]/10 text-[var(--kura-primary-light)]">
        {icon}
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
        {label}
      </p>
      {loading ? (
        <div className="mt-1.5 h-6 w-16 animate-pulse rounded bg-[var(--kura-bg-lighter)]" />
      ) : (
        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-[var(--kura-text)] sm:text-xl">
          {hidden ? "••••" : formatUsd(value)}
        </p>
      )}
    </Link>
  );
}
