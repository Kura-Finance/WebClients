/**
 * Li.Fi Bridge — cross-chain USDC from Base Safe.
 * Mirrors mobile `lib/api/bridge/lifiClient.ts`.
 * @see https://docs.li.fi/
 */

import { env } from "@/config/env";

export const LIFI_API = "https://li.quest/v1";
export const LIFI_DEFAULT_SLIPPAGE = 0.3;
export const BASE_CHAIN_ID = 8453;
export const GNOSIS_CHAIN_ID = 100;

export interface BridgeChain {
  id: number;
  key: string;
  name: string;
  native: string;
  color: string;
}

/** Same-chain Base send (not via Li.Fi). */
export const BASE_CHAIN: BridgeChain = {
  id: BASE_CHAIN_ID,
  key: "BASE",
  name: "Base",
  native: "ETH",
  color: "#0052FF",
};

export const BRIDGE_CHAINS: BridgeChain[] = [
  { id: 1, key: "ETH", name: "Ethereum", native: "ETH", color: "#627EEA" },
  { id: 10, key: "OP", name: "Optimism", native: "ETH", color: "#FF0420" },
  { id: 137, key: "POL", name: "Polygon", native: "POL", color: "#8247E5" },
  { id: 42161, key: "ARB", name: "Arbitrum", native: "ETH", color: "#28A0F0" },
  { id: GNOSIS_CHAIN_ID, key: "GNO", name: "Gnosis", native: "xDAI", color: "#04795B" },
];

export const SEND_CHAINS: BridgeChain[] = [BASE_CHAIN, ...BRIDGE_CHAINS];

const USDC_BY_CHAIN: Record<number, string> = {
  [BASE_CHAIN_ID]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  10: "0x0b2C639c533813c4Aa29D760963A1E5885780D50",
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [GNOSIS_CHAIN_ID]: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83",
};

export interface LiFiFeeCost {
  name: string;
  amount: string;
  amountUSD: string;
  token: { symbol: string; decimals: number };
}

export interface LiFiEstimate {
  toAmount: string;
  toAmountMin: string;
  toAmountUSD?: string;
  estimatedExecutionDuration?: number;
  feeCosts: LiFiFeeCost[];
  approvalAddress?: string;
}

export interface LiFiTransactionRequest {
  to: string;
  data: string;
  value: string;
  chainId: number;
  gasLimit?: string;
  gasPrice?: string;
}

export interface LiFiBridgeQuote {
  approvalAddress: string;
  fromAmount: string;
  fromToken: { address: string; symbol: string; decimals: number };
  toToken: { address: string; symbol: string; decimals: number; chainId: number };
  estimate: LiFiEstimate;
  transactionRequest: LiFiTransactionRequest;
  tools: string[];
}

function lifiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (env.lifiApiKey) headers["x-lifi-api-key"] = env.lifiApiKey;
  return headers;
}

function applyIntegratorParams(qs: URLSearchParams): void {
  if (!env.lifiIntegrator) return;
  qs.set("integrator", env.lifiIntegrator);
  if (env.lifiFee) qs.set("fee", env.lifiFee);
}

export async function fetchBridgeQuote(params: {
  fromChainId: number;
  toChainId: number;
  fromAmountWei: string;
  fromAddress: string;
  toAddress: string;
  slippage?: number;
}): Promise<LiFiBridgeQuote> {
  const {
    fromChainId,
    toChainId,
    fromAmountWei,
    fromAddress,
    toAddress,
    slippage = LIFI_DEFAULT_SLIPPAGE,
  } = params;

  const fromToken = USDC_BY_CHAIN[fromChainId] ?? "USDC";
  const toToken = USDC_BY_CHAIN[toChainId] ?? "USDC";

  const qs = new URLSearchParams({
    fromChain: String(fromChainId),
    toChain: String(toChainId),
    fromToken,
    toToken,
    fromAmount: fromAmountWei,
    fromAddress,
    toAddress,
    slippage: String(slippage),
  });
  applyIntegratorParams(qs);

  const res = await fetch(`${LIFI_API}/quote?${qs.toString()}`, {
    headers: lifiHeaders(),
  });
  const json = (await res.json()) as Record<string, unknown>;

  if (!res.ok) {
    const msg =
      (typeof json.message === "string" && json.message) ||
      `Li.Fi quote failed (${res.status})`;
    throw new Error(msg);
  }

  const tr = json.transactionRequest as Record<string, string> | undefined;
  if (!tr?.to || !tr?.data) {
    throw new Error("Unexpected Li.Fi quote response — missing transaction request");
  }

  const estimate = (json.estimate ?? {}) as Record<string, unknown>;
  const action = (json.action ?? {}) as Record<string, unknown>;
  const fromTok = (action.fromToken ?? {}) as Record<string, unknown>;
  const toTok = (action.toToken ?? {}) as Record<string, unknown>;
  const feeCostsRaw = (estimate.feeCosts ?? []) as Record<string, unknown>[];

  const est: LiFiEstimate = {
    toAmount: String(estimate.toAmount ?? "0"),
    toAmountMin: String(estimate.toAmountMin ?? "0"),
    toAmountUSD: estimate.toAmountUSD != null ? String(estimate.toAmountUSD) : undefined,
    estimatedExecutionDuration:
      typeof estimate.estimatedExecutionDuration === "number"
        ? estimate.estimatedExecutionDuration
        : undefined,
    feeCosts: feeCostsRaw.map((f) => {
      const token = (f.token ?? {}) as Record<string, unknown>;
      return {
        name: String(f.name ?? ""),
        amount: String(f.amount ?? "0"),
        amountUSD: String(f.amountUSD ?? "0"),
        token: {
          symbol: String(token.symbol ?? "USDC"),
          decimals: typeof token.decimals === "number" ? token.decimals : 6,
        },
      };
    }),
    approvalAddress: String(estimate.approvalAddress ?? tr.to),
  };

  const steps = ((json.includedSteps ?? []) as Record<string, unknown>[])
    .map((s) => s.tool as string)
    .filter(Boolean);

  return {
    approvalAddress: est.approvalAddress ?? tr.to,
    fromAmount: fromAmountWei,
    fromToken: {
      address: String(fromTok.address ?? ""),
      symbol: String(fromTok.symbol ?? "USDC"),
      decimals: typeof fromTok.decimals === "number" ? fromTok.decimals : 6,
    },
    toToken: {
      address: String(toTok.address ?? ""),
      symbol: String(toTok.symbol ?? "USDC"),
      decimals: typeof toTok.decimals === "number" ? toTok.decimals : 6,
      chainId: toChainId,
    },
    estimate: est,
    transactionRequest: {
      to: tr.to,
      data: tr.data,
      value: tr.value ?? "0x0",
      chainId: tr.chainId ? Number(tr.chainId) : fromChainId,
      gasLimit: tr.gasLimit,
      gasPrice: tr.gasPrice,
    },
    tools: steps,
  };
}

export function formatBridgeReceive(quote: LiFiBridgeQuote): string {
  try {
    const amount =
      parseFloat(quote.estimate.toAmountMin) / Math.pow(10, quote.toToken.decimals);
    return amount.toFixed(2);
  } catch {
    return "—";
  }
}

export function bridgeFeeUsdTotal(quote: LiFiBridgeQuote): number {
  try {
    return quote.estimate.feeCosts.reduce((sum, f) => {
      return sum + parseFloat(f.amount) / Math.pow(10, f.token.decimals);
    }, 0);
  } catch {
    return 0;
  }
}

export function formatBridgeFeeTotal(quote: LiFiBridgeQuote): string {
  const total = bridgeFeeUsdTotal(quote);
  if (total <= 0) return "$0.00";
  return `$${total.toFixed(4)}`;
}

export function formatBridgeTime(quote: LiFiBridgeQuote): string {
  const secs = quote.estimate.estimatedExecutionDuration;
  if (!secs) return "~2 min";
  if (secs < 60) return `~${secs}s`;
  return `~${Math.ceil(secs / 60)} min`;
}
