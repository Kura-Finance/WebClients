/**
 * Li.Fi same-chain token swap on Base (quote + transactionRequest).
 * Mirrors mobile `lifiSwapClient.ts`.
 */

import { env } from "@/config/env";
import { USDC_BASE } from "@/lib/baseChain";

const LIFI_API = "https://li.quest/v1";
const BASE_CHAIN_ID = 8453;
const DEFAULT_SLIPPAGE = 0.01;

export interface SwapQuote {
  fromToken: { address: string; symbol: string; decimals: number };
  toToken: { address: string; symbol: string; decimals: number };
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  toAmountUSD?: string;
  feeUSD: string;
  tools: string[];
  approvalAddress: string;
  transactionRequest: {
    to: string;
    data: string;
    value: string;
    chainId: number;
    gasLimit?: string;
  };
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

export async function fetchSwapQuote(params: {
  fromAmountWei: string;
  fromAddress: string;
  fromTokenAddress?: string;
  toTokenAddress: string;
  slippage?: number;
}): Promise<SwapQuote> {
  const {
    fromAmountWei,
    fromAddress,
    fromTokenAddress = USDC_BASE,
    toTokenAddress,
    slippage = DEFAULT_SLIPPAGE,
  } = params;

  const qs = new URLSearchParams({
    fromChain: String(BASE_CHAIN_ID),
    toChain: String(BASE_CHAIN_ID),
    fromToken: fromTokenAddress,
    toToken: toTokenAddress,
    fromAmount: fromAmountWei,
    fromAddress,
    toAddress: fromAddress,
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
      `Li.Fi swap quote failed (${res.status})`;
    throw new Error(msg);
  }

  const tr = json.transactionRequest as Record<string, string> | undefined;
  if (!tr?.to || !tr?.data) {
    throw new Error("Unexpected Li.Fi response — missing transactionRequest");
  }

  const est = (json.estimate ?? {}) as Record<string, unknown>;
  const feeCosts = (est.feeCosts ?? []) as { amountUSD?: string }[];
  const feeUSD = feeCosts
    .reduce((sum, f) => sum + parseFloat(f.amountUSD ?? "0"), 0)
    .toFixed(4);

  const action = (json.action ?? {}) as Record<string, unknown>;
  const fromTok = (action.fromToken ?? {}) as Record<string, unknown>;
  const toTok = (action.toToken ?? {}) as Record<string, unknown>;
  const tools = ((json.includedSteps ?? []) as { tool?: string }[])
    .map((s) => s.tool)
    .filter((t): t is string => !!t);

  return {
    fromToken: {
      address: String(fromTok.address ?? fromTokenAddress),
      symbol: String(fromTok.symbol ?? ""),
      decimals: typeof fromTok.decimals === "number" ? fromTok.decimals : 18,
    },
    toToken: {
      address: String(toTok.address ?? toTokenAddress),
      symbol: String(toTok.symbol ?? ""),
      decimals: typeof toTok.decimals === "number" ? toTok.decimals : 18,
    },
    fromAmount: fromAmountWei,
    toAmount: String(est.toAmount ?? "0"),
    toAmountMin: String(est.toAmountMin ?? "0"),
    toAmountUSD: est.toAmountUSD != null ? String(est.toAmountUSD) : undefined,
    feeUSD,
    tools,
    approvalAddress: String(est.approvalAddress ?? tr.to),
    transactionRequest: {
      to: tr.to,
      data: tr.data,
      value: tr.value ?? "0x0",
      chainId: tr.chainId ? Number(tr.chainId) : BASE_CHAIN_ID,
      gasLimit: tr.gasLimit,
    },
  };
}

export function toTokenWei(amount: number, decimals: number): string {
  if (!(amount > 0) || !Number.isFinite(amount)) return "0";
  const [whole, frac = ""] = amount.toFixed(decimals).split(".");
  const padded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const raw = `${whole}${padded}`.replace(/^0+(?=\d)/, "");
  return raw || "0";
}

export function fromTokenWei(wei: string, decimals: number): number {
  if (!wei || wei === "0") return 0;
  const neg = wei.startsWith("-");
  const digits = neg ? wei.slice(1) : wei;
  const padded = digits.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  const frac = padded.slice(-decimals);
  return parseFloat(`${neg ? "-" : ""}${whole}.${frac}`);
}

export function formatSwapReceive(quote: SwapQuote): string {
  const amount = fromTokenWei(quote.toAmountMin, quote.toToken.decimals);
  if (!(amount > 0)) return "—";
  if (amount >= 1000) return amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (amount >= 1) return amount.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return amount.toLocaleString("en-US", { maximumFractionDigits: 6 });
}
