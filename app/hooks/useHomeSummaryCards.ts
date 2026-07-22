"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useExchangeStore } from "@/store/useExchangeStore";
import { isHexAddress } from "@/lib/formatDisplay";
import {
  sumBorrowDebtsUsd,
  sumEarnPositionsUsd,
} from "@/lib/morphoPositions";

export function useHomeSummaryCards() {
  const portfolio = usePortfolio();
  const investments = useFinanceStore((s) => s.investments);
  const exchangeInvestments = useExchangeStore((s) => s.exchangeInvestments);

  const [earnUsd, setEarnUsd] = useState(0);
  const [loanUsd, setLoanUsd] = useState(0);
  const [defiLoading, setDefiLoading] = useState(false);

  const investmentUsd = useMemo(() => {
    const plaid = investments.reduce(
      (sum, i) => sum + Math.max(0, i.holdings * i.currentPrice),
      0,
    );
    const cex = exchangeInvestments.reduce(
      (sum, i) => sum + Math.max(0, i.holdings * i.currentPrice),
      0,
    );
    return plaid + cex;
  }, [investments, exchangeInvestments]);

  const cryptoSpotUsd = portfolio.totalValue;
  const cashAndCrypto = cryptoSpotUsd;

  const loadDefi = useCallback(async () => {
    const sca = portfolio.scaAddress;
    if (!isHexAddress(sca)) {
      setEarnUsd(0);
      setLoanUsd(0);
      return;
    }
    setDefiLoading(true);
    try {
      const [earn, loan] = await Promise.all([
        sumEarnPositionsUsd(sca),
        sumBorrowDebtsUsd(sca),
      ]);
      setEarnUsd(earn);
      setLoanUsd(loan);
    } catch {
      setEarnUsd(0);
      setLoanUsd(0);
    } finally {
      setDefiLoading(false);
    }
  }, [portfolio.scaAddress]);

  useEffect(() => {
    void loadDefi();
  }, [loadDefi]);

  const netWorth = cashAndCrypto + investmentUsd + earnUsd - loanUsd;

  return {
    netWorth,
    investmentUsd,
    loanUsd,
    earnUsd,
    loading: portfolio.loading || defiLoading,
    refresh: async () => {
      await portfolio.refresh();
      await loadDefi();
    },
  };
}
