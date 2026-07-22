"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CURATED_STOCKS,
  fetchCuratedStockQuotes,
  findStockMeta,
  type StockQuoteRow,
} from "@/lib/stockCatalog";
import { stockLogoUrl } from "@/lib/assetLogos";
import { hasBackendUrl } from "@/config/env";
import { requestJson } from "@/lib/httpClient";

interface DinariStock {
  id: string;
  symbol: string;
  name?: string;
}

async function tryFetchDinariCatalog(): Promise<DinariStock[] | null> {
  if (!hasBackendUrl()) return null;
  try {
    return await requestJson<DinariStock[]>(
      "/api/dinari/stocks?page=1&pageSize=50",
      { method: "GET" },
      "DinariAPI",
    );
  } catch {
    return null;
  }
}

export function useStockCatalog() {
  const [stocks, setStocks] = useState<StockQuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"coingecko" | "dinari">("coingecko");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [quotes, dinari] = await Promise.all([
        fetchCuratedStockQuotes(),
        tryFetchDinariCatalog(),
      ]);

      if (dinari && dinari.length > 0) {
        const bySymbol = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));
        const merged: StockQuoteRow[] = dinari.map((d) => {
          const sym = (d.symbol || "").toUpperCase();
          const q = bySymbol.get(sym);
          const meta = findStockMeta(sym);
          return {
            symbol: sym,
            name: d.name || q?.name || meta?.name || sym,
            color: q?.color ?? meta?.color ?? "#8B5CF6",
            logoUrl: q?.logoUrl ?? stockLogoUrl(sym),
            price: q?.price ?? 0,
            change24h: q?.change24h ?? null,
            volume24h: q?.volume24h ?? null,
            tvSymbol: q?.tvSymbol ?? meta?.tvSymbol ?? `NASDAQ:${sym}`,
          };
        });
        const curatedOrder = CURATED_STOCKS.map((s) => s.symbol);
        merged.sort((a, b) => {
          const ia = curatedOrder.indexOf(a.symbol);
          const ib = curatedOrder.indexOf(b.symbol);
          const ra = ia === -1 ? 999 : ia;
          const rb = ib === -1 ? 999 : ib;
          return ra - rb;
        });
        setStocks(merged);
        setSource("dinari");
      } else {
        setStocks(quotes);
        setSource("coingecko");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stocks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return { stocks, loading, refreshing, error, source, refresh: () => load(true) };
}
