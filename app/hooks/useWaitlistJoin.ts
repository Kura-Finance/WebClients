"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { hasBackendUrl } from "@/config/env";
import {
  getWaitlistStatus,
  joinWaitlist,
  type WaitlistProduct,
} from "@/lib/waitlistApi";

const STATUS_CACHE_TTL_MS = 5 * 60 * 1000;
const statusCache = new Map<string, { joined: boolean; expiresAt: number }>();

function cacheKey(email: string, product: WaitlistProduct): string {
  return `${email.toLowerCase()}:${product}`;
}

function readCached(email: string, product: WaitlistProduct): boolean | null {
  const hit = statusCache.get(cacheKey(email, product));
  if (!hit || hit.expiresAt <= Date.now()) return null;
  return hit.joined;
}

function writeCached(email: string, product: WaitlistProduct, joined: boolean): void {
  statusCache.set(cacheKey(email, product), {
    joined,
    expiresAt: Date.now() + STATUS_CACHE_TTL_MS,
  });
}

export function useWaitlistJoin(product: WaitlistProduct, enabled = true) {
  const email = useAppStore((s) => s.userProfile.email);
  const displayName = useAppStore((s) => s.userProfile.displayName);
  const hasRealEmail = Boolean(email?.trim() && email.includes("@"));

  const [joined, setJoined] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!enabled || !hasBackendUrl() || !hasRealEmail) {
      setJoined(false);
      setChecking(false);
      return;
    }

    const cached = readCached(email, product);
    if (cached !== null) {
      setJoined(cached);
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    void getWaitlistStatus(email, product)
      .then((status) => {
        if (cancelled) return;
        writeCached(email, product, status.joined);
        setJoined(status.joined);
      })
      .catch(() => {
        if (!cancelled) setJoined(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, email, hasRealEmail, product]);

  const join = useCallback(async () => {
    if (!hasBackendUrl()) throw new Error("WAITLIST_UNAVAILABLE");
    if (!hasRealEmail) throw new Error("EMAIL_REQUIRED");

    setSubmitting(true);
    try {
      const result = await joinWaitlist({
        email,
        product,
        name: displayName.trim() || undefined,
        source: "web_app",
      });
      writeCached(email, product, true);
      setJoined(true);
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [displayName, email, hasRealEmail, product]);

  return {
    join,
    joined,
    checking,
    submitting,
    hasRealEmail,
    backendAvailable: hasBackendUrl(),
  };
}
