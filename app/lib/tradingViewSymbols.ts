/**
 * TradingView symbol mapping for Base blue-chips.
 * Prefer Coinbase USD pairs when available.
 */

const TV_BY_SYMBOL: Record<string, string> = {
  ETH: "COINBASE:ETHUSD",
  WETH: "COINBASE:ETHUSD",
  CBBTC: "COINBASE:BTCUSD",
  BTC: "COINBASE:BTCUSD",
  CBETH: "COINBASE:ETHUSD",
  SOL: "COINBASE:SOLUSD",
  AERO: "BINANCE:AEROUSDT",
  DAI: "COINBASE:DAIUSD",
  USDC: "COINBASE:USDCUSD",
  USDE: "BINANCE:USDEUSDT",
  EURC: "COINBASE:EURCUSD",
  WSTETH: "BINANCE:WSTETHUSDT",
  MORPHO: "BINANCE:MORPHOUSDT",
  VIRTUAL: "BINANCE:VIRTUALUSDT",
  DEGEN: "BINANCE:DEGENUSDT",
  XSGD: "CRYPTO:XSGDUSD",
  AUDD: "CRYPTO:AUDDUSD",
  BRZ: "CRYPTO:BRZUSD",
  MXNE: "CRYPTO:MXNUSD",
};

/** TradingView symbol for a Kura portfolio ticker, or null if unknown. */
export function tradingViewSymbol(symbol: string): string | null {
  return TV_BY_SYMBOL[symbol.toUpperCase()] ?? null;
}

/** URL slug for markets routes — lowercase display symbol. */
export function marketSlug(symbol: string): string {
  return symbol.trim().toLowerCase();
}
