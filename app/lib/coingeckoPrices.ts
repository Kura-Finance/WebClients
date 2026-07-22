import { GECKO_IDS } from "@/lib/portfolioTokens";

export type PriceRow = {
  usd: number;
  usd_24h_change: number;
};

export type PriceMap = Record<string, PriceRow>;

const COINGECKO_URL =
  `https://api.coingecko.com/api/v3/simple/price` +
  `?ids=${GECKO_IDS}&vs_currencies=usd&include_24hr_change=true`;

const CACHE_TTL_MS = 3 * 60_000;

let priceCache: PriceMap | null = null;
let lastFetchAt = 0;
let fetchPromise: Promise<PriceMap> | null = null;

export async function fetchCoinGeckoPrices(force = false): Promise<PriceMap> {
  const now = Date.now();
  if (!force && priceCache && now - lastFetchAt < CACHE_TTL_MS) return priceCache;
  if (!force && fetchPromise) return fetchPromise;

  fetchPromise = fetch(COINGECKO_URL)
    .then(async (res) => {
      if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
      const data = (await res.json()) as PriceMap;
      priceCache = data;
      lastFetchAt = Date.now();
      return data;
    })
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}
