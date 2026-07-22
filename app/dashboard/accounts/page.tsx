"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetIcon from "@/components/ui/AssetIcon";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useAppStore } from "@/store/useAppStore";
import { PlaidApiError, disconnectPlaidItem } from "@/lib/plaidApi";
import {
  DashboardPage,
  PageAlert,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/dashboard/PageShell";
import CashFlowChartCard from "@/dashboard/_components/trackfi/CashFlowChartCard";

const ConnectAccountModal = dynamic(() => import("@/components/ConnectAccountModal"), {
  ssr: false,
});

function formatCurrency(value: number): string {
  return `$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseBankAccountName(
  rawName: string | undefined | null,
  mask?: string,
): { institutionName: string; accountLabel: string } {
  const safeName = rawName ?? "";
  const [institutionPart, accountPart] = safeName.split("·").map((part) => part.trim());
  const institutionName = institutionPart || safeName;

  let accountLabel = accountPart || institutionName;
  if (mask) {
    const escapedMask = mask.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    accountLabel = accountLabel.replace(new RegExp(`\\s*${escapedMask}$`), "").trim();
  }

  return { institutionName, accountLabel };
}

export default function AccountsPage() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [openMenuAccountId, setOpenMenuAccountId] = useState<string | null>(null);
  const [nicknameByAccountId, setNicknameByAccountId] = useState<Record<string, string>>({});
  const [unlinkingAccountId, setUnlinkingAccountId] = useState<string | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);

  const accounts = useFinanceStore((state) => state.accounts);
  const isLoadingPlaidData = useFinanceStore((state) => state.isLoadingPlaidData);
  const hydratePlaidFinanceData = useFinanceStore((state) => state.hydratePlaidFinanceData);
  const isBalanceHidden = useAppStore((state) => state.isBalanceHidden);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('[data-account-menu-root="true"]') ||
        target.closest('[data-account-menu-trigger="true"]')
      ) {
        return;
      }
      setOpenMenuAccountId(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const bankCashFlowBalance = useMemo(() => {
    return accounts.reduce((acc, account) => {
      const normalizedBalance = Number(account.balance) || 0;
      const contribution =
        account.type === "credit" ? -Math.abs(normalizedBalance) : normalizedBalance;
      return acc + contribution;
    }, 0);
  }, [accounts]);

  const availableBalance = useMemo(() => {
    return accounts.reduce((sum, account) => {
      const rawBalance = Number(account.balance) || 0;
      if (account.type === "credit") return sum - Math.abs(rawBalance);
      return sum + rawBalance;
    }, 0);
  }, [accounts]);

  const rows = useMemo(() => {
    return accounts.map((account) => {
      const balanceText =
        account.type === "credit"
          ? `−${formatCurrency(account.balance)}`
          : formatCurrency(account.balance);
      const { institutionName, accountLabel } = parseBankAccountName(account.name, account.mask);
      const nickname = nicknameByAccountId[account.id]?.trim();
      const displayName = nickname
        ? account.mask
          ? `${nickname} ••${account.mask}`
          : nickname
        : account.mask
          ? `${accountLabel} ••${account.mask}`
          : accountLabel;

      return {
        id: account.id,
        logo: account.logo,
        displayName,
        typeLabel: account.type,
        institutionLabel: institutionName,
        maskedBalance: isBalanceHidden ? "••••••" : balanceText,
        isCredit: account.type === "credit",
      };
    });
  }, [accounts, isBalanceHidden, nicknameByAccountId]);

  const handleEditNickname = (accountId: string, currentDisplayName: string) => {
    const nextNickname = window.prompt("Edit nickname", currentDisplayName);
    if (nextNickname === null) return;

    const trimmed = nextNickname.trim();
    setNicknameByAccountId((prev) => {
      if (!trimmed) {
        const next = { ...prev };
        delete next[accountId];
        return next;
      }
      return { ...prev, [accountId]: trimmed };
    });
    setOpenMenuAccountId(null);
  };

  const handleUnlink = async (accountId: string) => {
    setOpenMenuAccountId(null);
    setUnlinkingAccountId(accountId);
    setUnlinkError(null);
    try {
      await disconnectPlaidItem(accountId);
      await hydratePlaidFinanceData();
    } catch (error) {
      setUnlinkError(error instanceof PlaidApiError ? error.message : "Failed to unlink account.");
    } finally {
      setUnlinkingAccountId(null);
    }
  };

  return (
    <DashboardPage>
      {isConnectModalOpen ? (
        <ConnectAccountModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      ) : null}

      <PageHeader
        eyebrow="Bank"
        title="Linked accounts"
        description="Checking, savings, and credit cards synced via Plaid."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => void hydratePlaidFinanceData()}
              disabled={isLoadingPlaidData}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingPlaidData ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={() => setIsConnectModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add account
            </Button>
          </>
        }
      />

      {unlinkError ? <PageAlert variant="error">{unlinkError}</PageAlert> : null}

      <CashFlowChartCard
        totalBalance={bankCashFlowBalance}
        accountCount={accounts.length}
        onConnect={() => setIsConnectModalOpen(true)}
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2">
        <Panel padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Net bank cash
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--kura-text)]">
            {isBalanceHidden
              ? "••••••"
              : `${availableBalance < 0 ? "−" : ""}${formatCurrency(availableBalance)}`}
          </p>
        </Panel>
        <Panel padding="sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Accounts
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[var(--kura-text)]">
            {accounts.length}
          </p>
        </Panel>
      </section>

      <Panel padding="none">
        <div className="border-b border-[var(--kura-border)] px-5 py-4">
          <PanelHeader
            className="mb-0"
            title="Accounts"
            description="Balances and institution details"
          />
        </div>

        {isLoadingPlaidData ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--kura-bg-lighter)]" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <p className="text-sm text-[var(--kura-text-secondary)]">
              No bank accounts connected yet.
            </p>
            <Button size="sm" className="rounded-full" onClick={() => setIsConnectModalOpen(true)}>
              Connect account
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--kura-border)]">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AssetIcon
                    src={row.logo}
                    label={row.displayName}
                    color="#6366F1"
                    size={36}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--kura-text)]">
                      {row.displayName}
                    </p>
                    <p className="truncate text-[11px] text-[var(--kura-text-secondary)]">
                      {row.typeLabel} · {row.institutionLabel}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      row.isCredit ? "text-[var(--kura-error)]" : "text-[var(--kura-text)]"
                    }`}
                  >
                    {row.maskedBalance}
                  </p>
                  <div className="relative">
                    <button
                      type="button"
                      data-account-menu-trigger="true"
                      onClick={() =>
                        setOpenMenuAccountId((prev) => (prev === row.id ? null : row.id))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--kura-text-secondary)] transition-colors hover:bg-[var(--kura-bg-lighter)] hover:text-[var(--kura-text)] disabled:opacity-50"
                      disabled={unlinkingAccountId === row.id}
                      aria-label="Account actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {openMenuAccountId === row.id ? (
                      <div
                        data-account-menu-root="true"
                        className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-1 shadow-lg"
                      >
                        <button
                          type="button"
                          onClick={() => handleEditNickname(row.id, row.displayName)}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--kura-bg-lighter)]"
                        >
                          Edit nickname
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleUnlink(row.id)}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--kura-error)] transition-colors hover:bg-[var(--kura-bg-lighter)]"
                        >
                          Unlink
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </DashboardPage>
  );
}
