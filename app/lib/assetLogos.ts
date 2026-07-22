/**
 * Asset / ticker logos via logo.dev (same as mobile).
 * Clearbit is deprecated / shut down — do not use.
 */

import { env } from "@/config/env";

function logoDevToken(): string {
  return env.logodevToken;
}

/** US equity ticker logo — `img.logo.dev/ticker/{SYMBOL}`. */
export function stockLogoUrl(symbol: string, size = 64): string | null {
  const token = logoDevToken();
  const ticker = symbol.trim().toUpperCase();
  if (!token || !ticker) return null;
  return (
    `https://img.logo.dev/ticker/${encodeURIComponent(ticker)}` +
    `?token=${encodeURIComponent(token)}&size=${size}&format=png`
  );
}

/** Crypto symbol logo — `img.logo.dev/crypto/{symbol}`. */
export function cryptoLogoUrl(symbol: string, size = 128): string | null {
  const token = logoDevToken();
  if (!token || !symbol) return null;
  return (
    `https://img.logo.dev/crypto/${encodeURIComponent(symbol.trim().toLowerCase())}` +
    `?token=${encodeURIComponent(token)}&size=${size}&format=png`
  );
}

/** Company logo by domain — `img.logo.dev/{domain}`. */
export function domainLogoUrl(domain: string, size = 64): string | null {
  const token = logoDevToken();
  if (!token || !domain) return null;
  const host = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!host) return null;
  return (
    `https://img.logo.dev/${encodeURIComponent(host)}` +
    `?token=${encodeURIComponent(token)}&size=${size}&format=png`
  );
}

export function stockGlyph(symbol: string): string {
  return (symbol || "?").slice(0, 2).toUpperCase();
}
