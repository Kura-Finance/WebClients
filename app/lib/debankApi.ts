import { requestJson } from './httpClient';

export interface DeBankTokenPosition {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  logo: string;
  chain?: string;
}

export interface DeBankProtocolPosition {
  id: string;
  name: string;
  usdValue: number;
  chain?: string;
  logo: string;
}

export interface DeBankPositionsResponse<T> {
  positions: T[];
  lastSyncedAt: string | null;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function extractArrayPayload<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  const record = toRecord(payload);
  if (!record) return [];

  const candidates = [record.data, record.result, record.list, record.items, record.positions];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }
  return [];
}

function extractLastSyncedAt(payload: unknown): string | null {
  const record = toRecord(payload);
  if (!record) return null;

  const topLevel = toStringValue(record.lastSyncedAt);
  if (topLevel) return topLevel;

  const dataRecord = toRecord(record.data);
  if (!dataRecord) return null;
  return toStringValue(dataRecord.lastSyncedAt) || null;
}

function normalizeToken(raw: unknown): DeBankTokenPosition | null {
  const token = toRecord(raw);
  if (!token) return null;

  const symbol = toStringValue(token.optimized_symbol ?? token.symbol, 'TOKEN');
  const name = toStringValue(token.name, symbol);
  const amount = toNumber(token.amount ?? token.balance ?? token.raw_amount);
  const price = toNumber(token.price ?? token.price_usd ?? token.usd_price);
  const chain = toStringValue(token.chain ?? token.chain_id);
  const id =
    toStringValue(token.id) ||
    toStringValue(token.token_id) ||
    `${chain || 'evm'}-${symbol.toLowerCase()}`;
  const logo =
    toStringValue(token.logo_url) ||
    toStringValue(token.logo) ||
    'https://www.google.com/s2/favicons?domain=debank.com&sz=128';

  return { id, symbol, name, amount, price, logo, chain };
}

function normalizeProtocol(raw: unknown): DeBankProtocolPosition | null {
  const protocol = toRecord(raw);
  if (!protocol) return null;

  const stats = toRecord(protocol.stats);
  const id =
    toStringValue(protocol.id) ||
    toStringValue(protocol.protocol_id) ||
    toStringValue(protocol.name, 'protocol').toLowerCase().replace(/\s+/g, '-');
  const name = toStringValue(protocol.name, 'Protocol Position');
  const usdValue = toNumber(
    protocol.usd_value ??
      protocol.net_usd_value ??
      stats?.net_usd_value ??
      stats?.asset_usd_value ??
      protocol.value,
  );
  const chain = toStringValue(protocol.chain ?? protocol.chain_id);
  const logo =
    toStringValue(protocol.logo_url) ||
    toStringValue(protocol.logo) ||
    'https://www.google.com/s2/favicons?domain=debank.com&sz=128';

  return { id, name, usdValue, chain, logo };
}

export const fetchDeBankTokenPositions = async (
  address: string,
  refresh = false,
): Promise<DeBankPositionsResponse<DeBankTokenPosition>> => {
  const query = new URLSearchParams({ address });
  if (refresh) query.set('refresh', 'true');
  const payload = await requestJson<unknown>(`/api/debank/tokens?${query.toString()}`, { method: 'GET' }, 'DeBankAPI');
  return {
    positions: extractArrayPayload<unknown>(payload).map(normalizeToken).filter((item): item is DeBankTokenPosition => Boolean(item)),
    lastSyncedAt: extractLastSyncedAt(payload),
  };
};

export const fetchDeBankProtocolPositions = async (
  address: string,
  refresh = false,
): Promise<DeBankPositionsResponse<DeBankProtocolPosition>> => {
  const query = new URLSearchParams({ address });
  if (refresh) query.set('refresh', 'true');
  const payload = await requestJson<unknown>(
    `/api/debank/protocols?${query.toString()}`,
    { method: 'GET' },
    'DeBankAPI',
  );
  return {
    positions: extractArrayPayload<unknown>(payload)
      .map(normalizeProtocol)
      .filter((item): item is DeBankProtocolPosition => Boolean(item)),
    lastSyncedAt: extractLastSyncedAt(payload),
  };
};

export const unlinkDeBankAddress = (address: string): Promise<{ message?: string }> => {
  return requestJson<{ message?: string }>(
    `/api/debank/addresses/${encodeURIComponent(address)}`,
    { method: 'DELETE' },
    'DeBankAPI',
  );
};
