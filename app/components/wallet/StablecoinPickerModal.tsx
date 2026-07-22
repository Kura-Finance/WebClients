"use client";

import React from "react";
import { Check } from "lucide-react";
import { HOME_STABLECOINS, type StablecoinToken } from "@/lib/baseChain";
import { cryptoLogoUrl } from "@/lib/assetLogos";
import AssetIcon from "@/components/ui/AssetIcon";
import Modal from "@/components/ui/Modal";

const STABLE_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  EURC: "#1E4BD2",
  DAI: "#F5AC37",
  XSGD: "#E31C23",
  AUDD: "#00843D",
  BRZ: "#009C3B",
  MXNe: "#006847",
};

interface StablecoinPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  selectedSymbol: string;
  excludedSymbol?: string;
  balances?: Record<string, number>;
  onSelect: (token: StablecoinToken) => void;
}

export default function StablecoinPickerModal({
  isOpen,
  onClose,
  title = "Select stablecoin",
  selectedSymbol,
  excludedSymbol,
  balances,
  onSelect,
}: StablecoinPickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClassName="max-w-sm">
      <ul className="space-y-1">
        {HOME_STABLECOINS.map((token) => {
          const disabled = excludedSymbol === token.symbol;
          const selected = selectedSymbol === token.symbol;
          const bal = balances?.[token.symbol];
          return (
            <li key={token.symbol}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  disabled
                    ? "cursor-not-allowed opacity-40"
                    : selected
                      ? "cursor-pointer bg-[var(--kura-primary)]/10 hover:bg-[var(--kura-primary)]/15"
                      : "cursor-pointer hover:bg-[var(--kura-bg-light)]"
                }`}
              >
                <AssetIcon
                  src={cryptoLogoUrl(token.symbol)}
                  label={token.symbol}
                  color={STABLE_COLORS[token.symbol] ?? "#64748B"}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--kura-text)]">{token.symbol}</p>
                  <p className="truncate text-[11px] text-[var(--kura-text-secondary)]">
                    {token.name}
                  </p>
                </div>
                {typeof bal === "number" ? (
                  <span className="text-xs tabular-nums text-[var(--kura-text-secondary)]">
                    {bal.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                ) : null}
                {selected ? <Check className="h-4 w-4 text-[var(--kura-primary)]" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
