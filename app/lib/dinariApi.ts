/**
 * Dinari dShares via Kura backend `/api/dinari/*`.
 */

import { requestJson } from "@/lib/httpClient";
import type { TypedDataInput } from "@/lib/smartAccountSend";

const API = "DinariAPI";
export const DINARI_CHAIN_ID = "eip155:8453";

export type KycStatus = "not_started" | "PENDING" | "NEEDS_REVIEW" | "PASS" | "FAIL";

export interface DinariEntity {
  entityId: string;
  kycStatus: KycStatus;
  canTransact: boolean;
}

export interface DinariKycLink {
  embedUrl: string;
  expiresAt: string;
}

export interface DinariAccount {
  accountId: string;
  walletAddress: string | null;
  walletChainId: string | null;
  isActive: boolean;
}

export interface DinariWalletNonce {
  nonce: string;
  message: string;
  chainId?: string;
}

export interface DinariStock {
  id: string;
  symbol: string;
  name: string;
  [key: string]: unknown;
}

export interface DinariStockQuote {
  bid?: number;
  ask?: number;
  spread?: number;
}

export type OrderSide = "BUY" | "SELL";

export interface DinariPreparedOrder {
  orderRequestId: string;
  permit: TypedDataInput;
}

export interface DinariOrderResult {
  orderRequestId: string;
  orderId: string | null;
  status: string;
  side: OrderSide;
  stockId: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseQuotePrice(value: unknown): number | undefined {
  const n = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function getEntity(): Promise<DinariEntity> {
  return requestJson<DinariEntity>("/api/dinari/entity", {}, API);
}

export function createKycLink(name?: string): Promise<DinariKycLink> {
  return requestJson<DinariKycLink>(
    "/api/dinari/kyc-link",
    { method: "POST", body: JSON.stringify(name ? { name } : {}) },
    API,
  );
}

export function getAccount(): Promise<DinariAccount> {
  return requestJson<DinariAccount>("/api/dinari/account", {}, API);
}

export function getWalletNonce(walletAddress: string): Promise<DinariWalletNonce> {
  return requestJson<DinariWalletNonce>(
    "/api/dinari/wallet/nonce",
    {
      method: "POST",
      body: JSON.stringify({ walletAddress, chainId: DINARI_CHAIN_ID }),
    },
    API,
  );
}

export function connectWallet(params: {
  walletAddress: string;
  nonce: string;
  signature: string;
}): Promise<DinariAccount> {
  return requestJson<DinariAccount>(
    "/api/dinari/wallet/connect",
    {
      method: "POST",
      body: JSON.stringify({
        walletAddress: params.walletAddress,
        chainId: DINARI_CHAIN_ID,
        nonce: params.nonce,
        signature: params.signature,
      }),
    },
    API,
  );
}

export function listStocks(params?: {
  symbols?: string[];
  page?: number;
  pageSize?: number;
}): Promise<DinariStock[]> {
  const qs = new URLSearchParams();
  if (params?.symbols?.length) qs.set("symbols", params.symbols.join(","));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return requestJson<DinariStock[]>(`/api/dinari/stocks${suffix}`, {}, API);
}

export async function getStockQuote(stockId: string): Promise<DinariStockQuote> {
  const raw = await requestJson<unknown>(`/api/dinari/stocks/${stockId}/quote`, {}, API);
  const payload = isObject(raw)
    ? (isObject(raw.quote) ? raw.quote : isObject(raw.data) ? raw.data : raw)
    : {};
  const bid = parseQuotePrice(payload.bid ?? payload.bid_price ?? payload.bidPrice);
  const ask = parseQuotePrice(payload.ask ?? payload.ask_price ?? payload.askPrice);
  return {
    bid,
    ask,
    spread: bid != null && ask != null ? ask - bid : undefined,
  };
}

export function prepareOrder(params: {
  side: OrderSide;
  stockId: string;
  paymentTokenQuantity?: string;
  assetTokenQuantity?: string;
  clientOrderId?: string;
}): Promise<DinariPreparedOrder> {
  return requestJson<DinariPreparedOrder>(
    "/api/dinari/orders/prepare",
    { method: "POST", body: JSON.stringify(params) },
    API,
  );
}

export function submitOrder(params: {
  orderRequestId: string;
  permitSignature: string;
}): Promise<DinariOrderResult> {
  return requestJson<DinariOrderResult>(
    "/api/dinari/orders/submit",
    { method: "POST", body: JSON.stringify(params) },
    API,
  );
}

/** Full place order: prepare → SCA signTypedData → submit. */
export async function placeDinariOrder(params: {
  side: OrderSide;
  stockId: string;
  paymentTokenQuantity?: string;
  assetTokenQuantity?: string;
  signPermit: (permit: TypedDataInput) => Promise<string>;
}): Promise<DinariOrderResult> {
  const prepared = await prepareOrder({
    side: params.side,
    stockId: params.stockId,
    paymentTokenQuantity: params.paymentTokenQuantity,
    assetTokenQuantity: params.assetTokenQuantity,
  });
  const permitSignature = await params.signPermit(prepared.permit);
  return submitOrder({
    orderRequestId: prepared.orderRequestId,
    permitSignature,
  });
}
