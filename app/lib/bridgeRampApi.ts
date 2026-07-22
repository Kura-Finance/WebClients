/**
 * Bridge.xyz fiat ⇄ stablecoin via Kura backend (/api/bridge/*).
 */

import { ApiError } from "./errorHandler";
import { requestJson } from "./httpClient";

const apiName = "BridgeRampApi";

export type FiatCurrency = "usd" | "eur" | "gbp" | "brl" | "mxn" | "cop";

export type KycStatus =
  | "not_started"
  | "under_review"
  | "incomplete"
  | "approved"
  | "rejected"
  | "paused"
  | "awaiting_questionnaire"
  | "awaiting_ubo"
  | string;

export type TosStatus = "pending" | "approved" | string;

export interface DepositFee {
  developerFeePercent: string;
  feeCurrency: string;
}

export interface MinDeposit {
  amount: string;
  currency: string;
}

export interface DepositResult {
  depositId: string | null;
  bridgeVirtualAccountId: string;
  status: string;
  completed: boolean;
  amount: string | null;
  currency: string | null;
  netAmount: string | null;
  destinationTxHash: string | null;
  createdAt: string;
  updatedAt?: string;
  paymentRail?: string | null;
  senderName?: string | null;
  accountLast4?: string | null;
}

export interface TransferResult {
  bridgeTransferId: string;
  direction: "onramp" | "offramp" | "crypto" | string;
  state: string;
  amount: string | null;
  sourceRail: string | null;
  sourceCurrency: string | null;
  destinationRail: string | null;
  destinationCurrency: string | null;
  destinationAddress: string | null;
  createdAt: string;
}

export interface PayoutAddressResult {
  bridgeLiquidationAddressId: string;
  depositAddress: string;
  destinationRail?: string | null;
  destinationCurrency?: string | null;
  bridgeExternalAccountId?: string;
  sourceChain?: string;
  sourceCurrency?: string;
  payoutFee?: DepositFee | null;
  state?: string;
  createdAt?: string;
}

export interface PayoutDrainResult {
  bridgeDrainId?: string;
  drainId?: string;
  state: string;
  amount: string | null;
  currency: string | null;
  depositTxHash?: string | null;
  createdAt: string;
  updatedAt?: string;
  destination?: { payment_rail?: string; currency?: string; last4?: string } | null;
}

export interface BridgeEndorsement {
  name: string;
  status: string;
  requirements?: Record<string, unknown>;
}

export interface BridgeCustomer {
  bridgeCustomerId: string | null;
  customerType: "individual" | "business" | null;
  kycStatus: KycStatus;
  tosStatus: TosStatus;
  endorsements: BridgeEndorsement[];
  canTransact: boolean;
  rejectionReasons?: { reason: string; createdAt?: string }[];
}

export interface VirtualAccountDepositInstructions {
  currency?: string;
  bank_name?: string;
  bank_address?: string;
  bank_routing_number?: string;
  bank_account_number?: string;
  bank_beneficiary_name?: string;
  bank_beneficiary_address?: string;
  payment_rails?: string[];
  iban?: string;
  bic?: string;
  sort_code?: string;
  account_number?: string;
  clabe?: string;
  pix_key?: string;
  bre_b_key?: string;
  account_holder_name?: string;
  [key: string]: string | string[] | undefined;
}

export interface VirtualAccount {
  bridgeVirtualAccountId: string;
  status: string;
  sourceCurrency: string;
  destinationRail: string;
  destinationCurrency: string;
  destinationAddress: string | null;
  developerFeePercent: string | null;
  depositFee?: DepositFee | null;
  minDeposit?: MinDeposit | null;
  depositInstructions: VirtualAccountDepositInstructions | null;
  createdAt: string;
}

export interface KycLinkResult {
  bridgeCustomerId: string | null;
  kycLinkId: string | null;
  customerType: "individual" | "business";
  kycLink: string | null;
  tosLink: string | null;
  kycStatus: KycStatus;
  tosStatus: TosStatus;
  /** Present when requesting an extra rail endorsement for an existing customer. */
  requestedEndorsement?: BridgeEndorsementType;
}

export type BridgeEndorsementType =
  | "base"
  | "cards"
  | "cop"
  | "faster_payments"
  | "pix"
  | "sepa"
  | "spei";

export type BridgeCustomerType = "individual" | "business";

/** Request body for POST /api/bridge/kyc-link (KYC individual or KYB business). */
export interface CreateKycLinkBody {
  /** `individual` = KYC, `business` = KYB. Defaults to individual. */
  type?: BridgeCustomerType;
  /**
   * Individual: person's full name.
   * Business (KYB): company legal name (Bridge allows up to 1024 chars).
   */
  fullName: string;
  email?: string;
  endorsements?: BridgeEndorsementType[];
  redirectUri?: string;
  /** Required by Bridge when the name contains non-Latin-1 characters. */
  transliteratedFirstName?: string;
  transliteratedMiddleName?: string;
  transliteratedLastName?: string;
  transliteratedBusinessLegalName?: string;
}

export interface EndorsementLinkResult {
  kycLink: string | null;
  tosLink?: string | null;
}

export interface FiatOption {
  code: FiatCurrency;
  label: string;
  name: string;
  rails: string;
}

export const FIAT_OPTIONS: FiatOption[] = [
  { code: "usd", label: "USD", name: "US Dollar", rails: "ACH · Wire" },
  { code: "eur", label: "EUR", name: "Euro", rails: "SEPA" },
  { code: "gbp", label: "GBP", name: "British Pound", rails: "Faster Payments" },
  { code: "mxn", label: "MXN", name: "Mexican Peso", rails: "SPEI" },
  { code: "brl", label: "BRL", name: "Brazilian Real", rails: "Pix" },
  { code: "cop", label: "COP", name: "Colombian Peso", rails: "Bre-B · PSE" },
];

const FIAT_ENDORSEMENT_BY_CURRENCY: Partial<Record<FiatCurrency, string>> = {
  brl: "pix",
  cop: "cop",
  mxn: "spei",
  gbp: "faster_payments",
};

const DOC_MIN: Record<FiatCurrency, MinDeposit> = {
  usd: { amount: "1", currency: "usd" },
  eur: { amount: "1", currency: "eur" },
  gbp: { amount: "2", currency: "gbp" },
  mxn: { amount: "50", currency: "mxn" },
  brl: { amount: "10", currency: "brl" },
  cop: { amount: "100", currency: "cop" },
};

const ARRIVAL: Record<string, string> = {
  usdAch: "ACH usually arrives in 1–3 business days",
  usdWire: "Wire usually arrives same day or next business day",
  sepa: "SEPA usually arrives in 1 business day",
  gbpFps: "Faster Payments usually arrive within minutes",
  spei: "SPEI usually arrives within minutes",
  pix: "Pix usually arrives within minutes",
  copBreB: "Bre-B / PSE timing depends on your bank",
};

function asArray<T>(
  raw: unknown,
  keys: string[] = ["items", "data", "deposits", "drains", "transfers"],
): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

function normalizeKycStatus(status: string | null | undefined): string {
  return (status || "").toLowerCase().replace(/-/g, "_");
}

export function isKycApproved(status: string | null | undefined): boolean {
  const key = normalizeKycStatus(status);
  return key === "approved" || key === "active";
}

export function isKycInReview(status: string | null | undefined): boolean {
  const key = normalizeKycStatus(status);
  return ["pending", "in_review", "under_review", "processing", "submitted"].includes(key);
}

export function isBridgeTransactReady(customer: BridgeCustomer | null): boolean {
  if (!customer) return false;
  return customer.canTransact || isKycApproved(customer.kycStatus);
}

export function isBusinessCustomer(customer: BridgeCustomer | null): boolean {
  return customer?.customerType === "business";
}

/** KYB uses the same status field as KYC on Bridge customers. */
export function isKybApproved(customer: BridgeCustomer | null): boolean {
  return isBusinessCustomer(customer) && isBridgeTransactReady(customer);
}

export function isKybInReview(customer: BridgeCustomer | null): boolean {
  return isBusinessCustomer(customer) && isKycInReview(customer?.kycStatus);
}

export function formatDepositFeeLabel(depositFee?: DepositFee | null): string | null {
  const percent = depositFee?.developerFeePercent;
  if (percent == null || percent === "") return null;
  const currency = (depositFee?.feeCurrency ?? "").toUpperCase();
  return currency ? `${percent}% ${currency}` : `${percent}%`;
}

export function formatMinDepositLabel(minDeposit?: MinDeposit | null): string | null {
  const amount = minDeposit?.amount;
  if (amount == null || amount === "") return null;
  const currency = (minDeposit?.currency ?? "").toUpperCase();
  return currency ? `${amount} ${currency}` : amount;
}

function resolveArrival(currency: FiatCurrency, paymentRails?: string[] | null): string {
  if (currency === "usd" && paymentRails?.some((r) => r.toLowerCase() === "wire")) {
    return ARRIVAL.usdWire;
  }
  const map: Record<FiatCurrency, string> = {
    usd: ARRIVAL.usdAch,
    eur: ARRIVAL.sepa,
    gbp: ARRIVAL.gbpFps,
    mxn: ARRIVAL.spei,
    brl: ARRIVAL.pix,
    cop: ARRIVAL.copBreB,
  };
  return map[currency];
}

export function buildFiatDepositBullets(
  currency: FiatCurrency,
  opts: {
    minDeposit?: MinDeposit | null;
    feeLabel?: string | null;
    paymentRails?: string[] | null;
  },
): string[] {
  const bullets: string[] = [];
  const minLabel = formatMinDepositLabel(opts.minDeposit ?? DOC_MIN[currency]);
  if (minLabel) bullets.push(`Minimum deposit: ${minLabel}`);
  bullets.push("Prefer transfers from an account in your own name");
  bullets.push(resolveArrival(currency, opts.paymentRails));
  if (opts.feeLabel) bullets.push(`Deposit fee: ${opts.feeLabel}`);
  bullets.push("Funds convert to USDC on Base and credit your Smart Wallet");
  return bullets;
}

export function getPendingFiatEndorsement(
  customer: BridgeCustomer | null,
  currency: FiatCurrency,
): string | null {
  const endorsement = FIAT_ENDORSEMENT_BY_CURRENCY[currency];
  if (!endorsement || !customer || !isKycApproved(customer.kycStatus)) return null;
  const approved = customer.endorsements?.some(
    (e) => e.name === endorsement && e.status === "approved",
  );
  return approved ? null : endorsement;
}

export function isUnsupportedCurrencyError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 400 && /not supported|unsupported/i.test(error.message);
}

export function isEndorsementRequiredError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 409 &&
    (/endorsement/i.test(error.message) || /ENDORSEMENT/i.test(error.message))
  );
}

export async function listDeposits(force = false): Promise<DepositResult[]> {
  const q = force ? "?force=true" : "";
  const raw = await requestJson<unknown>(`/api/bridge/deposits${q}`, { method: "GET" }, apiName);
  return asArray<DepositResult>(raw);
}

export async function listTransfers(): Promise<TransferResult[]> {
  const raw = await requestJson<unknown>("/api/bridge/transfers", { method: "GET" }, apiName);
  return asArray<TransferResult>(raw);
}

export async function listPayoutAddresses(): Promise<PayoutAddressResult[]> {
  const raw = await requestJson<unknown>("/api/bridge/payout-address", { method: "GET" }, apiName);
  return asArray<PayoutAddressResult>(raw, ["items", "data", "addresses", "payoutAddresses"]);
}

export async function listPayoutDrains(liquidationAddressId: string): Promise<PayoutDrainResult[]> {
  const raw = await requestJson<unknown>(
    `/api/bridge/payout-address/${liquidationAddressId}/drains`,
    { method: "GET" },
    apiName,
  );
  return asArray<PayoutDrainResult>(raw);
}

export async function getBridgeCustomer(): Promise<BridgeCustomer | null> {
  try {
    return await requestJson<BridgeCustomer>("/api/bridge/customer", { method: "GET" }, apiName);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

export async function createKycLink(body: CreateKycLinkBody): Promise<KycLinkResult> {
  const { type = "individual", ...rest } = body;
  return requestJson<KycLinkResult>(
    "/api/bridge/kyc-link",
    {
      method: "POST",
      body: JSON.stringify({ type, ...rest }),
    },
    apiName,
  );
}

/**
 * Start or resume Bridge KYB (Know Your Business).
 * `fullName` must be the company legal name; UBO / docs are collected in Bridge hosted flow.
 */
export async function createKybLink(body: {
  businessLegalName: string;
  email?: string;
  redirectUri?: string;
  endorsements?: BridgeEndorsementType[];
  transliteratedBusinessLegalName?: string;
}): Promise<KycLinkResult> {
  return createKycLink({
    type: "business",
    fullName: body.businessLegalName,
    email: body.email,
    redirectUri: body.redirectUri,
    endorsements: body.endorsements,
    transliteratedBusinessLegalName: body.transliteratedBusinessLegalName,
  });
}

export async function createEndorsementLink(currency: FiatCurrency): Promise<EndorsementLinkResult> {
  return requestJson<EndorsementLinkResult>(
    "/api/bridge/endorsement-link",
    {
      method: "POST",
      body: JSON.stringify({ currency }),
    },
    apiName,
  );
}

export async function listOnRampAccounts(): Promise<VirtualAccount[]> {
  const raw = await requestJson<unknown>("/api/bridge/onramp", { method: "GET" }, apiName);
  return asArray<VirtualAccount>(raw, ["items", "data", "accounts"]);
}

export async function getOrCreateOnRampAccount(body: {
  sourceCurrency: FiatCurrency;
  destinationRail?: "base";
  destinationCurrency?: "usdc";
  toAddress?: string;
}): Promise<VirtualAccount> {
  return requestJson<VirtualAccount>(
    "/api/bridge/onramp",
    {
      method: "POST",
      body: JSON.stringify({
        sourceCurrency: body.sourceCurrency,
        destinationRail: body.destinationRail ?? "base",
        destinationCurrency: body.destinationCurrency ?? "usdc",
        toAddress: body.toAddress,
      }),
    },
    apiName,
  );
}

export type DepositInstructionRow = { key: string; label: string; value: string };

export function depositInstructionRows(
  di: VirtualAccountDepositInstructions,
): DepositInstructionRow[] {
  const holder =
    di.bank_beneficiary_name?.trim() || di.account_holder_name?.trim() || undefined;
  return [
    { key: "account_holder_name", label: "Account holder", value: holder },
    { key: "bank_account_number", label: "Account number", value: di.bank_account_number },
    { key: "bank_routing_number", label: "Routing number", value: di.bank_routing_number },
    { key: "iban", label: "IBAN", value: di.iban },
    { key: "bic", label: "BIC", value: di.bic },
    { key: "sort_code", label: "Sort code", value: di.sort_code },
    { key: "account_number", label: "Account number", value: di.account_number },
    { key: "clabe", label: "CLABE", value: di.clabe },
    { key: "pix_key", label: "Pix key", value: di.pix_key },
    { key: "bre_b_key", label: "Bre-B key", value: di.bre_b_key },
    { key: "bank_name", label: "Bank", value: di.bank_name },
    { key: "bank_address", label: "Bank address", value: di.bank_address },
    {
      key: "bank_beneficiary_address",
      label: "Beneficiary address",
      value: di.bank_beneficiary_address,
    },
  ].filter((r): r is DepositInstructionRow => Boolean(r.value));
}

/* ─── Off-ramp (payout) ─── */

export type FiatRail =
  | "ach_push"
  | "ach_same_day"
  | "wire"
  | "sepa"
  | "spei"
  | "pix"
  | "faster_payments";

export interface ExternalAccountResult {
  bridgeExternalAccountId: string;
  bankName: string | null;
  accountOwnerName: string | null;
  last4: string | null;
  currency: string;
  active: boolean;
}

export interface PayoutOption {
  destinationRail: FiatRail | string;
  destinationCurrency: FiatCurrency | string;
  label?: string;
}

export const DEFAULT_PAYOUT_OPTIONS: PayoutOption[] = [
  { destinationRail: "ach_same_day", destinationCurrency: "usd", label: "ACH Same Day" },
  { destinationRail: "wire", destinationCurrency: "usd", label: "Wire" },
  { destinationRail: "sepa", destinationCurrency: "eur", label: "SEPA" },
  { destinationRail: "faster_payments", destinationCurrency: "gbp", label: "Faster Payments" },
  { destinationRail: "pix", destinationCurrency: "brl", label: "Pix" },
  { destinationRail: "spei", destinationCurrency: "mxn", label: "SPEI" },
];

function parsePayoutOptionRow(row: unknown): PayoutOption | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  const destinationRail = (r.destinationRail ?? r.destination_rail ?? r.rail) as string | undefined;
  const destinationCurrency = (
    r.destinationCurrency ??
    r.destination_currency ??
    r.currency
  ) as string | undefined;
  if (!destinationRail || !destinationCurrency) return null;
  return {
    destinationRail,
    destinationCurrency: destinationCurrency.toLowerCase(),
    label: typeof r.label === "string" ? r.label : undefined,
  };
}

export async function listExternalAccounts(): Promise<ExternalAccountResult[]> {
  const raw = await requestJson<unknown>("/api/bridge/external-accounts", { method: "GET" }, apiName);
  return asArray<ExternalAccountResult>(raw, ["items", "data", "accounts"]);
}

export async function createExternalAccount(body: {
  currency: FiatCurrency;
  accountType: "us" | "iban" | "clabe" | "pix" | "gb";
  accountOwnerName: string;
  firstName: string;
  lastName: string;
  accountNumber?: string;
  routingNumber?: string;
  checkingOrSavings?: "checking" | "savings";
  bankName?: string;
}): Promise<ExternalAccountResult> {
  return requestJson<ExternalAccountResult>(
    "/api/bridge/external-accounts",
    { method: "POST", body: JSON.stringify(body) },
    apiName,
  );
}

export async function listPayoutOptions(): Promise<PayoutOption[]> {
  try {
    const raw = await requestJson<unknown>("/api/bridge/payout-options", { method: "GET" }, apiName);
    if (Array.isArray(raw)) {
      const parsed = raw.map(parsePayoutOptionRow).filter((x): x is PayoutOption => x != null);
      if (parsed.length > 0) return parsed;
      if (raw.length === 0) return [];
    }
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, unknown>;
      for (const key of ["items", "data", "options"]) {
        if (Array.isArray(obj[key])) {
          const parsed = (obj[key] as unknown[])
            .map(parsePayoutOptionRow)
            .filter((x): x is PayoutOption => x != null);
          if (parsed.length > 0) return parsed;
        }
      }
    }
  } catch {
    /* fall through to defaults */
  }
  return DEFAULT_PAYOUT_OPTIONS;
}

export async function createPayoutAddress(body: {
  destinationRail: string;
  destinationCurrency: string;
  externalAccountId: string;
  returnAddress: string;
}): Promise<PayoutAddressResult> {
  return requestJson<PayoutAddressResult>(
    "/api/bridge/payout-address",
    { method: "POST", body: JSON.stringify(body) },
    apiName,
  );
}

export async function getOrCreatePayoutAddress(body: {
  destinationRail: string;
  destinationCurrency: string;
  externalAccountId: string;
  returnAddress: string;
}): Promise<PayoutAddressResult> {
  const findExisting = (rows: PayoutAddressResult[]) =>
    rows.find(
      (a) =>
        a.bridgeExternalAccountId === body.externalAccountId &&
        a.destinationRail === body.destinationRail &&
        a.destinationCurrency === body.destinationCurrency,
    );

  const existing = findExisting(await listPayoutAddresses());
  if (existing) return existing;

  try {
    return await createPayoutAddress(body);
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const retry = findExisting(await listPayoutAddresses());
      if (retry) return retry;
    }
    throw error;
  }
}

export function payoutRailLabel(rail: string): string {
  const map: Record<string, string> = {
    ach_same_day: "ACH Same Day",
    ach_push: "ACH",
    wire: "Wire",
    sepa: "SEPA",
    faster_payments: "Faster Payments",
    pix: "Pix",
    spei: "SPEI",
  };
  return map[rail.toLowerCase()] ?? rail;
}
