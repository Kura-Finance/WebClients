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
  assets: DeBankProtocolAsset[];
}

export interface DeBankProtocolAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  usdValue: number;
  logo: string;
}

export interface DeBankPositionsResponse<T> {
  positions: T[];
  lastSyncedAt: string | null;
}

function normalizeEvmAddress(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(normalized) ? normalized : null;
}

function extractAddressArrayPayload(payload: unknown): string[] {
  const directList = extractArrayPayload<unknown>(payload);
  const normalizedDirect = directList
    .map((item) => {
      if (typeof item === 'string') return normalizeEvmAddress(item);
      const record = toRecord(item);
      if (!record) return null;
      return normalizeEvmAddress(record.address ?? record.walletAddress ?? record.wallet_address);
    })
    .filter((address): address is string => Boolean(address));

  if (normalizedDirect.length > 0) {
    return Array.from(new Set(normalizedDirect));
  }

  const record = toRecord(payload);
  if (!record) return [];

  const nestedCandidates = [record.addresses, record.wallets, record.linkedAddresses, record.linked_addresses];
  for (const candidate of nestedCandidates) {
    if (!Array.isArray(candidate)) continue;
    const normalized = candidate
      .map((item) => {
        if (typeof item === 'string') return normalizeEvmAddress(item);
        const itemRecord = toRecord(item);
        if (!itemRecord) return null;
        return normalizeEvmAddress(itemRecord.address ?? itemRecord.walletAddress ?? itemRecord.wallet_address);
      })
      .filter((address): address is string => Boolean(address));
    if (normalized.length > 0) {
      return Array.from(new Set(normalized));
    }
  }

  return [];
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

function arrayOrEmpty<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeProtocolAsset(raw: unknown, fallbackId: string): DeBankProtocolAsset | null {
  const token = toRecord(raw);
  if (!token) return null;

  const symbol = toStringValue(token.optimized_symbol ?? token.symbol, 'ASSET');
  const name = toStringValue(token.name, symbol);
  const amount = toNumber(token.amount ?? token.balance ?? token.raw_amount);
  const price = toNumber(token.price ?? token.price_usd ?? token.usd_price);
  const explicitUsd = toNumber(token.usd_value ?? token.net_usd_value ?? token.value);
  const usdValue = explicitUsd > 0 ? explicitUsd : amount * price;
  const id = toStringValue(token.id) || toStringValue(token.token_id) || `${fallbackId}-${symbol.toLowerCase()}`;
  const logo =
    toStringValue(token.logo_url) ||
    toStringValue(token.logo) ||
    'https://www.google.com/s2/favicons?domain=debank.com&sz=128';

  return { id, symbol, name, amount, price, usdValue, logo };
}

function extractProtocolAssets(raw: Record<string, unknown>, protocolId: string): DeBankProtocolAsset[] {
  const detail = toRecord(raw.detail);
  const portfolioItems = [
    ...arrayOrEmpty<unknown>(raw.portfolio_item_list),
    ...arrayOrEmpty<unknown>(detail?.portfolio_item_list),
  ];

  const assetsFromPortfolio = portfolioItems.flatMap((item, itemIndex) => {
    const itemRecord = toRecord(item);
    if (!itemRecord) return [];
    const itemDetail = toRecord(itemRecord.detail);

    const tokenCandidates = [
      ...arrayOrEmpty<unknown>(itemRecord.token_list),
      ...arrayOrEmpty<unknown>(itemRecord.asset_list),
      ...arrayOrEmpty<unknown>(itemRecord.supply_token_list),
      ...arrayOrEmpty<unknown>(itemRecord.borrow_token_list),
      ...arrayOrEmpty<unknown>(itemRecord.reward_token_list),
      ...arrayOrEmpty<unknown>(itemDetail?.token_list),
      ...arrayOrEmpty<unknown>(itemDetail?.asset_list),
      ...arrayOrEmpty<unknown>(itemDetail?.supply_token_list),
      ...arrayOrEmpty<unknown>(itemDetail?.borrow_token_list),
      ...arrayOrEmpty<unknown>(itemDetail?.reward_token_list),
    ];

    const normalized = tokenCandidates
      .map((token, tokenIndex) =>
        normalizeProtocolAsset(token, `${protocolId}-item-${itemIndex}-asset-${tokenIndex}`),
      )
      .filter((asset): asset is DeBankProtocolAsset => Boolean(asset));

    if (normalized.length > 0) {
      return normalized;
    }

    const itemStats = toRecord(itemRecord.stats);
    const fallbackName = toStringValue(itemRecord.name, 'Position');
    const fallbackUsd = toNumber(itemStats?.asset_usd_value ?? itemStats?.net_usd_value ?? itemRecord.usd_value);
    if (fallbackUsd <= 0) {
      return [];
    }

    return [
      {
        id: `${protocolId}-item-${itemIndex}`,
        symbol: fallbackName.toUpperCase(),
        name: fallbackName,
        amount: 0,
        price: 0,
        usdValue: fallbackUsd,
        logo: 'https://www.google.com/s2/favicons?domain=debank.com&sz=128',
      },
    ];
  });

  if (assetsFromPortfolio.length > 0) {
    return assetsFromPortfolio;
  }

  const directTokenCandidates = [
    ...arrayOrEmpty<unknown>(raw.token_list),
    ...arrayOrEmpty<unknown>(raw.asset_list),
    ...arrayOrEmpty<unknown>(raw.supply_token_list),
    ...arrayOrEmpty<unknown>(raw.borrow_token_list),
    ...arrayOrEmpty<unknown>(raw.reward_token_list),
  ];

  return directTokenCandidates
    .map((token, tokenIndex) => normalizeProtocolAsset(token, `${protocolId}-asset-${tokenIndex}`))
    .filter((asset): asset is DeBankProtocolAsset => Boolean(asset));
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
  const assets = extractProtocolAssets(protocol, id);

  return { id, name, usdValue, chain, logo, assets };
}

export const fetchDeBankTokenPositions = async (
  address: string,
  refresh = false,
): Promise<DeBankPositionsResponse<DeBankTokenPosition>> => {
  const query = new URLSearchParams({ address });
  if (refresh) query.set('refresh', 'true');
  const payload = await requestJson<unknown>(
    `/api/debank/tokens?${query.toString()}`,
    { method: 'GET' },
    'DeBankAPI',
  );
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

export const fetchLinkedDeBankAddresses = async (): Promise<string[]> => {
  const payload = await requestJson<unknown>('/api/debank/addresses', { method: 'GET' }, 'DeBankAPI');
  return extractAddressArrayPayload(payload);
};
