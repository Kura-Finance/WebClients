/**
 * Tokenized US stocks (Dinari dShares) — curated catalog + CoinGecko prices.
 */

import { stockLogoUrl } from "@/lib/assetLogos";

export interface StockMeta {
  symbol: string;
  name: string;
  color: string;
  /** CoinGecko id for dShare price when available. */
  geckoId?: string;
  /** TradingView equity symbol (underlying). */
  tvSymbol: string;
}

export const CURATED_STOCKS: readonly StockMeta[] = [
  { symbol: "AAPL", name: "Apple Inc.", color: "#A2AAAD", geckoId: "dinari-aapl-dshares", tvSymbol: "NASDAQ:AAPL" },
  { symbol: "TSLA", name: "Tesla, Inc.", color: "#E82127", geckoId: "dinari-tsla-dshares", tvSymbol: "NASDAQ:TSLA" },
  { symbol: "NVDA", name: "NVIDIA Corporation", color: "#76B900", geckoId: "dinari-nvda-dshares", tvSymbol: "NASDAQ:NVDA" },
  { symbol: "MSFT", name: "Microsoft Corporation", color: "#00A4EF", geckoId: "dinari-msft-dshares", tvSymbol: "NASDAQ:MSFT" },
  { symbol: "GOOGL", name: "Alphabet Inc.", color: "#4285F4", geckoId: "dinari-googl-dshares", tvSymbol: "NASDAQ:GOOGL" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", color: "#FF9900", geckoId: "dinari-amzn-dshares", tvSymbol: "NASDAQ:AMZN" },
  { symbol: "META", name: "Meta Platforms, Inc.", color: "#0866FF", geckoId: "dinari-meta-dshare", tvSymbol: "NASDAQ:META" },
  { symbol: "NFLX", name: "Netflix, Inc.", color: "#E50914", geckoId: "dinari-nflx-dshares", tvSymbol: "NASDAQ:NFLX" },
  { symbol: "AMD", name: "Advanced Micro Devices", color: "#ED1C24", geckoId: "dinari-amd", tvSymbol: "NASDAQ:AMD" },
  { symbol: "COIN", name: "Coinbase Global, Inc.", color: "#0052FF", geckoId: "dinari-coin", tvSymbol: "NASDAQ:COIN" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", color: "#6E44FF", geckoId: "dinari-spy-dshares", tvSymbol: "AMEX:SPY" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", color: "#00C2A8", tvSymbol: "NASDAQ:QQQ" },
  { symbol: "PLTR", name: "Palantir Technologies", color: "#000000", tvSymbol: "NASDAQ:PLTR" },
  { symbol: "ARM", name: "Arm Holdings", color: "#0091DA", tvSymbol: "NASDAQ:ARM" },
  { symbol: "AVGO", name: "Broadcom Inc.", color: "#CC092F", tvSymbol: "NASDAQ:AVGO" },
  { symbol: "COST", name: "Costco Wholesale", color: "#E31837", tvSymbol: "NASDAQ:COST" },
] as const;

export interface StockQuoteRow {
  symbol: string;
  name: string;
  color: string;
  logoUrl: string | null;
  price: number;
  change24h: number | null;
  volume24h: number | null;
  tvSymbol: string;
}

type PriceRow = {
  usd?: number;
  usd_24h_change?: number;
  usd_24h_vol?: number;
};

export function stockSlug(symbol: string): string {
  return symbol.trim().toLowerCase();
}

export function findStockMeta(symbol: string): StockMeta | undefined {
  return CURATED_STOCKS.find((s) => s.symbol.toLowerCase() === symbol.toLowerCase());
}

export async function fetchCuratedStockQuotes(): Promise<StockQuoteRow[]> {
  const ids = [...new Set(CURATED_STOCKS.map((s) => s.geckoId).filter(Boolean))] as string[];
  let prices: Record<string, PriceRow> = {};

  if (ids.length > 0) {
    try {
      const url =
        `https://api.coingecko.com/api/v3/simple/price` +
        `?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
      const res = await fetch(url);
      if (res.ok) {
        prices = (await res.json()) as Record<string, PriceRow>;
      }
    } catch {
      /* keep zeros */
    }
  }

  return CURATED_STOCKS.map((s) => {
    const row = s.geckoId ? prices[s.geckoId] : undefined;
    return {
      symbol: s.symbol,
      name: s.name,
      color: s.color,
      logoUrl: stockLogoUrl(s.symbol),
      price: row?.usd ?? 0,
      change24h: row?.usd_24h_change ?? null,
      volume24h: row?.usd_24h_vol ?? null,
      tvSymbol: s.tvSymbol,
    };
  });
}

export function formatStockPrice(price: number): string {
  if (!price || price <= 0) return "—";
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatVolume(vol: number | null): string {
  if (vol == null || !Number.isFinite(vol) || vol <= 0) return "—";
  if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(2)}B`;
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}
