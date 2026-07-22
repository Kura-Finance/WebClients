/**
 * Blue-chip tokens on Base for Portfolio (mirrors mobile BLUE_CHIPS, Cash/Crypto only).
 */

export interface PortfolioTokenMeta {
  geckoId: string;
  symbol: string;
  name: string;
  displayName: string;
  color: string;
  /** ERC-20 on Base; null = native ETH */
  baseAddress: `0x${string}` | null;
  decimals: number;
  trackBalance?: boolean;
}

/** USD / EUR / regional fiat stablecoins → Cash group. */
export const STABLECOIN_SYMBOLS = new Set([
  "USDC",
  "DAI",
  "EURC",
  "XSGD",
  "AUDD",
  "BRZ",
  "MXNE",
]);

export const PORTFOLIO_TOKENS: readonly PortfolioTokenMeta[] = [
  {
    geckoId: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    displayName: "USDC",
    color: "#2775CA",
    baseAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  {
    geckoId: "ethereum",
    symbol: "ETH",
    name: "Ether",
    displayName: "ETH",
    color: "#627EEA",
    baseAddress: null,
    decimals: 18,
  },
  {
    geckoId: "ethereum",
    symbol: "WETH",
    name: "Wrapped Ether",
    displayName: "WETH",
    color: "#627EEA",
    baseAddress: "0x4200000000000000000000000000000000000006",
    decimals: 18,
  },
  {
    geckoId: "bitcoin",
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    displayName: "cbBTC",
    color: "#F7931A",
    baseAddress: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    decimals: 8,
  },
  {
    geckoId: "coinbase-wrapped-staked-eth",
    symbol: "cbETH",
    name: "Coinbase Staked ETH",
    displayName: "cbETH",
    color: "#4B9CD3",
    baseAddress: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    decimals: 18,
  },
  {
    geckoId: "aerodrome-finance",
    symbol: "AERO",
    name: "Aerodrome",
    displayName: "AERO",
    color: "#00D4FF",
    baseAddress: "0x940181a94A35A4569E4529A3CDfB74e38FD98631",
    decimals: 18,
  },
  {
    geckoId: "dai",
    symbol: "DAI",
    name: "Dai Stablecoin",
    displayName: "DAI",
    color: "#F5AC37",
    baseAddress: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
  },
  {
    geckoId: "ethena-usde",
    symbol: "USDe",
    name: "Ethena USDe",
    displayName: "USDe",
    color: "#111111",
    baseAddress: "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34",
    decimals: 18,
  },
  {
    geckoId: "euro-coin",
    symbol: "EURC",
    name: "Euro Coin",
    displayName: "EURC",
    color: "#2E6BE6",
    baseAddress: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
    decimals: 6,
  },
  {
    geckoId: "xsgd",
    symbol: "XSGD",
    name: "XSGD",
    displayName: "XSGD",
    color: "#EF3340",
    baseAddress: "0x0A4C9cb2778aB3302996A34BeFCF9a8Bc288C33b",
    decimals: 6,
  },
  {
    geckoId: "novatti-australian-digital-dollar",
    symbol: "AUDD",
    name: "Australian Digital Dollar",
    displayName: "AUDD",
    color: "#00843D",
    baseAddress: "0x449b3317a6d1efb1bc3ba0700c9eaa4ffff4ae65",
    decimals: 6,
  },
  {
    geckoId: "brz",
    symbol: "BRZ",
    name: "Brazilian Digital Token",
    displayName: "BRZ",
    color: "#009C3B",
    baseAddress: "0xE9185Ee218cae427aF7B9764A011bb89FeA761B4",
    decimals: 18,
  },
  {
    geckoId: "real-mxn",
    symbol: "MXNe",
    name: "Real MXN",
    displayName: "MXNe",
    color: "#006847",
    baseAddress: "0x269cae7dc59803e5c596c95756faeebb6030e0af",
    decimals: 6,
  },
  {
    geckoId: "wrapped-steth",
    symbol: "wstETH",
    name: "Wrapped Liquid Staked ETH",
    displayName: "wstETH",
    color: "#00A3FF",
    baseAddress: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    decimals: 18,
  },
  {
    geckoId: "morpho",
    symbol: "MORPHO",
    name: "Morpho",
    displayName: "MORPHO",
    color: "#3B5BFE",
    baseAddress: "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842",
    decimals: 18,
  },
  {
    geckoId: "virtual-protocol",
    symbol: "VIRTUAL",
    name: "Virtuals Protocol",
    displayName: "VIRTUAL",
    color: "#5D5FEF",
    baseAddress: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
    decimals: 18,
  },
  {
    geckoId: "degen-base",
    symbol: "DEGEN",
    name: "Degen",
    displayName: "DEGEN",
    color: "#A36EFD",
    baseAddress: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
    decimals: 18,
  },
  {
    geckoId: "base-bridged-sol-base",
    symbol: "SOL",
    name: "Solana",
    displayName: "SOL",
    color: "#9945FF",
    baseAddress: "0x311935Cd80B76769bF2ecC9D8Ab7635b2139cf82",
    decimals: 9,
  },
] as const;

export const GECKO_IDS = [...new Set(PORTFOLIO_TOKENS.map((t) => t.geckoId))].join(",");

export function isStablecoinSymbol(symbol: string): boolean {
  return STABLECOIN_SYMBOLS.has(symbol.toUpperCase());
}

export type PortfolioDisplayGroup = "cash" | "crypto";

export const ALLOCATION_COLORS: Record<PortfolioDisplayGroup, string> = {
  cash: "#8B5CF6",
  crypto: "#10B981",
};

const SMALL_BALANCE_USD = 1;

export function getPortfolioGroup(symbol: string): PortfolioDisplayGroup {
  return isStablecoinSymbol(symbol) ? "cash" : "crypto";
}

export function shouldShowHolding(value: number, holdings: number, hideSmall: boolean): boolean {
  if (holdings <= 0 || value <= 0) return false;
  return !hideSmall || value >= SMALL_BALANCE_USD;
}
