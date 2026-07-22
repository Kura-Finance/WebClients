/**
 * Treasury API — /api/treasuries
 *
 * Contract:
 *   GET    /              → { treasuries[], activeTreasuryId }
 *                         (invalid active is auto-corrected + written back)
 *   POST   /              → create one; same address is idempotent
 *                         (returns existing + sets active — not 409)
 *   PUT    /              → full replace (delete-all then insert). Migration only.
 *                         Misuse clears the workspace.
 *   PUT    /active        → { activeTreasuryId } → workspace
 *   PATCH  /:id           → rename
 *   DELETE /:id           → remove → workspace
 *
 * Rules:
 *   - source=created requires saltNonce (integer string ≥ 1)
 *   - source=bound must omit saltNonce
 *   - address: 0x + 40 hex; server stores lowercase (checksum in UI)
 *   - optional client id; global id clash → 409 CONFLICT
 *   - duplicate id in PUT body → 400 DUPLICATE_ID
 *   - personal SCA → 400 PERSONAL_SCA
 */

import { getAddress } from "viem";
import { ApiError } from "./errorHandler";
import { requestJson } from "./httpClient";
import type { OrgTreasury, TreasurySource } from "@/lib/orgTreasury";

const apiName = "TreasuryApi";

export interface TreasuryWorkspace {
  treasuries: OrgTreasury[];
  activeTreasuryId: string | null;
}

export type CreateTreasuryInput = {
  id?: string;
  name?: string;
  address: string;
  source: TreasurySource;
  saltNonce?: string;
};

/** EIP-55 checksum for display; falls back to lowercase if invalid. */
export function checksumAddress(address: string): string {
  try {
    return getAddress(address.trim());
  } catch {
    return address.trim().toLowerCase();
  }
}

function normalizeTreasury(raw: unknown): OrgTreasury | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const addressRaw = typeof t.address === "string" ? t.address.trim() : "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(addressRaw)) return null;
  const source = t.source === "bound" ? "bound" : t.source === "created" ? "created" : null;
  if (!source) return null;
  const id =
    typeof t.id === "string" && t.id.trim()
      ? t.id.trim()
      : `try_${addressRaw.slice(2, 10).toLowerCase()}`;
  const name =
    typeof t.name === "string" && t.name.trim() ? t.name.trim().slice(0, 64) : "Treasury";
  const createdAt =
    typeof t.createdAt === "string" && t.createdAt
      ? t.createdAt
      : new Date().toISOString();
  const saltNonce =
    source === "created" && typeof t.saltNonce === "string" && t.saltNonce
      ? t.saltNonce
      : undefined;
  return {
    id,
    name,
    address: checksumAddress(addressRaw),
    source,
    createdAt,
    ...(saltNonce ? { saltNonce } : {}),
  };
}

export function normalizeWorkspace(raw: unknown): TreasuryWorkspace {
  if (!raw || typeof raw !== "object") {
    return { treasuries: [], activeTreasuryId: null };
  }
  const data = raw as Record<string, unknown>;
  const list = Array.isArray(data.treasuries) ? data.treasuries : [];
  const treasuries = list
    .map(normalizeTreasury)
    .filter((t): t is OrgTreasury => Boolean(t));
  const active =
    typeof data.activeTreasuryId === "string" && data.activeTreasuryId
      ? data.activeTreasuryId
      : null;
  // Prefer server active; only soft-fix locally if missing from list
  // (server GET already persists corrections).
  const activeTreasuryId =
    active && treasuries.some((t) => t.id === active)
      ? active
      : treasuries[0]?.id ?? null;
  return { treasuries, activeTreasuryId };
}

export function isTreasuryApiUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 501);
}

export function treasuryErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const msg = `${error.message} ${error.userMessage}`.toLowerCase();
  if (msg.includes("personal_sca") || msg.includes("personal smart wallet")) {
    return "PERSONAL_SCA";
  }
  if (error.status === 409 || msg.includes("conflict")) return "CONFLICT";
  if (error.status === 403 || msg.includes("forbidden")) return "FORBIDDEN";
  if (msg.includes("duplicate_id") || msg.includes("duplicate treasury id")) {
    return "DUPLICATE_ID";
  }
  if (msg.includes("saltnonce") || msg.includes("invalid_salt")) return "INVALID_SALT";
  return null;
}

function createBody(input: CreateTreasuryInput): Record<string, unknown> {
  const address = input.address.trim().toLowerCase();
  const body: Record<string, unknown> = {
    address,
    source: input.source,
  };
  if (input.id?.trim()) body.id = input.id.trim();
  if (input.name?.trim()) body.name = input.name.trim().slice(0, 64);
  if (input.source === "created") {
    if (!input.saltNonce || !/^\d+$/.test(input.saltNonce) || BigInt(input.saltNonce) < BigInt(1)) {
      throw new ApiError("saltNonce must be an integer string ≥ 1 for created treasuries", 400);
    }
    body.saltNonce = input.saltNonce;
  }
  // bound: never send saltNonce
  return body;
}

export async function fetchTreasuries(): Promise<TreasuryWorkspace> {
  const raw = await requestJson<unknown>("/api/treasuries", { method: "GET" }, apiName);
  return normalizeWorkspace(raw);
}

/** Full replace — migration / disaster recovery only. Prefer POST/PATCH/DELETE. */
export async function replaceTreasuries(
  workspace: TreasuryWorkspace,
): Promise<TreasuryWorkspace> {
  const raw = await requestJson<unknown>(
    "/api/treasuries",
    {
      method: "PUT",
      body: JSON.stringify({
        activeTreasuryId: workspace.activeTreasuryId,
        treasuries: workspace.treasuries.map((t) => ({
          id: t.id,
          name: t.name,
          address: t.address.trim().toLowerCase(),
          source: t.source,
          ...(t.source === "created" && t.saltNonce ? { saltNonce: t.saltNonce } : {}),
          createdAt: t.createdAt,
        })),
      }),
    },
    apiName,
  );
  return normalizeWorkspace(raw);
}

export async function createTreasury(
  input: CreateTreasuryInput,
): Promise<OrgTreasury> {
  const raw = await requestJson<unknown>(
    "/api/treasuries",
    {
      method: "POST",
      body: JSON.stringify(createBody(input)),
    },
    apiName,
  );
  const entry = normalizeTreasury(raw);
  if (!entry) throw new ApiError("Invalid treasury response", 500);
  return entry;
}

export async function patchTreasury(
  id: string,
  patch: { name: string },
): Promise<OrgTreasury> {
  const raw = await requestJson<unknown>(
    `/api/treasuries/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
    apiName,
  );
  const entry = normalizeTreasury(raw);
  if (!entry) throw new ApiError("Invalid treasury response", 500);
  return entry;
}

export async function deleteTreasury(id: string): Promise<TreasuryWorkspace> {
  const raw = await requestJson<unknown>(
    `/api/treasuries/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    apiName,
  );
  return normalizeWorkspace(raw);
}

export async function setActiveTreasuryRemote(
  activeTreasuryId: string | null,
): Promise<TreasuryWorkspace> {
  const raw = await requestJson<unknown>(
    "/api/treasuries/active",
    {
      method: "PUT",
      body: JSON.stringify({ activeTreasuryId }),
    },
    apiName,
  );
  return normalizeWorkspace(raw);
}
