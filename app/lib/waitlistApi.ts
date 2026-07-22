/**
 * Public waitlist API — /api/waitlist/*
 */

import { requestJson } from "./httpClient";

const apiName = "WaitlistApi";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WAITLIST_PRODUCTS = {
  METAL_CARD: "metal-card",
  VIRTUAL_CARD: "virtual-card",
} as const;

export type WaitlistProduct = (typeof WAITLIST_PRODUCTS)[keyof typeof WAITLIST_PRODUCTS];

export interface WaitlistEntry {
  id: string;
  email: string;
  product: string;
  name?: string | null;
  source?: string | null;
  createdAt: string;
}

export interface JoinWaitlistResponse {
  entry: WaitlistEntry;
  alreadyJoined: boolean;
}

export interface WaitlistStatusResponse {
  joined: boolean;
  entry: WaitlistEntry | null;
}

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new Error("email must be a valid address");
  }
  return normalized;
}

function normalizeProduct(product: string): string {
  return product.trim().toLowerCase();
}

export async function joinWaitlist(params: {
  email: string;
  product: WaitlistProduct;
  name?: string;
  source?: string;
}): Promise<JoinWaitlistResponse> {
  return requestJson<JoinWaitlistResponse>(
    "/api/waitlist",
    {
      method: "POST",
      body: JSON.stringify({
        email: normalizeEmail(params.email),
        product: normalizeProduct(params.product),
        ...(params.name?.trim() ? { name: params.name.trim() } : {}),
        ...(params.source?.trim() ? { source: params.source.trim() } : {}),
      }),
    },
    apiName,
  );
}

export async function getWaitlistStatus(
  email: string,
  product: WaitlistProduct,
): Promise<WaitlistStatusResponse> {
  const query = new URLSearchParams({
    email: normalizeEmail(email),
    product: normalizeProduct(product),
  });
  return requestJson<WaitlistStatusResponse>(
    `/api/waitlist/status?${query.toString()}`,
    { method: "GET" },
    apiName,
  );
}
