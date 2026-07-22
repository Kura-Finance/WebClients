"use client";

import React, { useState } from "react";
import { Building2, Loader2, ShieldCheck, User } from "lucide-react";
import {
  createKybLink,
  createKycLink,
  isBusinessCustomer,
  isKycInReview,
  type BridgeCustomer,
  type BridgeCustomerType,
} from "@/lib/bridgeRampApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function openExternal(url: string | null | undefined) {
  if (!url || typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function errMessage(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong.";
}

export type BridgeVerifyMode = "deposit" | "withdraw";

/**
 * Shared KYC / KYB gate for Add Money + Transfer bank flows.
 * Individual = personal KYC; Business = KYB (legal entity name).
 */
export default function BridgeVerifyGate({
  mode,
  customer,
  defaultName,
  defaultEmail,
  redirectPath,
  onComplete,
  onError,
}: {
  mode: BridgeVerifyMode;
  customer: BridgeCustomer | null;
  defaultName: string;
  defaultEmail: string;
  /** e.g. /dashboard/add-money or /dashboard/payment */
  redirectPath: string;
  onComplete: () => Promise<void> | void;
  onError: (message: string) => void;
}) {
  const [kind, setKind] = useState<BridgeCustomerType>(
    isBusinessCustomer(customer) ? "business" : "individual",
  );
  const [businessName, setBusinessName] = useState(defaultName);
  const [busy, setBusy] = useState(false);

  const inReview = isKycInReview(customer?.kycStatus);
  const title = mode === "deposit" ? "Verify to deposit" : "Verify to withdraw";
  const blurb =
    kind === "business"
      ? "Bridge KYB verifies your business. Prefer a work email for business fiat rails."
      : mode === "deposit"
        ? "Bridge KYC is required once. After approval you get permanent bank deposit details."
        : "Bridge KYC is required once before bank payouts.";

  const handleStart = async () => {
    const email = defaultEmail.trim() || undefined;
    if (!email) {
      onError("Link an email in Profile before starting Bridge verification.");
      return;
    }
    if (kind === "individual" && !defaultName.trim()) {
      onError("Add your name in Profile before starting Bridge KYC.");
      return;
    }
    if (kind === "business" && !businessName.trim()) {
      onError("Enter the business legal name for KYB.");
      return;
    }

    setBusy(true);
    onError("");
    try {
      const redirectUri =
        typeof window !== "undefined" ? `${window.location.origin}${redirectPath}` : undefined;

      const result =
        kind === "business"
          ? await createKybLink({
              businessLegalName: businessName.trim(),
              email,
              redirectUri,
            })
          : await createKycLink({
              fullName: defaultName.trim(),
              email,
              redirectUri,
            });

      openExternal(result.tosLink);
      openExternal(result.kycLink);
      await onComplete();
    } catch (e) {
      onError(errMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-surface)] p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--kura-primary)]/12 text-[var(--kura-primary-light)]">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <h2 className="text-base font-semibold text-[var(--kura-text)]">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--kura-text-secondary)]">{blurb}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setKind("individual")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
            kind === "individual"
              ? "border-[var(--kura-primary)] bg-[var(--kura-primary)]/10 text-[var(--kura-primary)]"
              : "border-[var(--kura-border)] text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Personal KYC
        </button>
        <button
          type="button"
          onClick={() => setKind("business")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
            kind === "business"
              ? "border-[var(--kura-primary)] bg-[var(--kura-primary)]/10 text-[var(--kura-primary)]"
              : "border-[var(--kura-border)] text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Business KYB
        </button>
      </div>

      {kind === "business" ? (
        <div className="mt-3">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[var(--kura-text-secondary)]">
            Business legal name
          </label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Acme Holdings Ltd."
          />
        </div>
      ) : null}

      {inReview ? (
        <p className="mt-3 text-xs text-[var(--kura-text-secondary)]">
          Verification is under review. Refresh after Bridge emails you.
        </p>
      ) : (
        <Button
          type="button"
          className="mt-4 w-full"
          size="lg"
          disabled={busy}
          onClick={() => void handleStart()}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening Bridge…
            </>
          ) : kind === "business" ? (
            "Start Bridge KYB"
          ) : (
            "Start Bridge KYC"
          )}
        </Button>
      )}
    </div>
  );
}
