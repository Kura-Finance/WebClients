"use client";

import React from "react";
import { Check, ChevronDown, Vault } from "lucide-react";
import type { OrgTreasury } from "@/lib/orgTreasury";
import { cn } from "@/lib/utils";

function truncate(address: string): string {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function TreasurySwitcher({
  treasuries,
  activeId,
  onSelect,
  className,
}: {
  treasuries: OrgTreasury[];
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const active = treasuries.find((t) => t.id === activeId) ?? treasuries[0] ?? null;
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!active || treasuries.length === 0) return null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--kura-border)] bg-[var(--kura-surface)] px-3 py-1.5 text-left text-xs font-semibold text-[var(--kura-text)] hover:bg-[var(--kura-bg-light)]/40"
      >
        <Vault className="h-3.5 w-3.5 shrink-0 text-[var(--kura-primary-light)]" />
        <span className="min-w-0 truncate">{active.name}</span>
        <span className="hidden font-mono text-[10px] font-normal text-[var(--kura-text-secondary)] sm:inline">
          {truncate(active.address)}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 opacity-60 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute left-0 z-40 mt-1.5 min-w-[240px] overflow-hidden rounded-xl border border-[var(--kura-border)] bg-[var(--kura-surface)] shadow-lg">
          <ul className="max-h-64 overflow-y-auto py-1">
            {treasuries.map((t) => {
              const selected = t.id === active.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(t.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-[var(--kura-bg-light)]/50",
                      selected ? "bg-[var(--kura-primary)]/5" : "",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[var(--kura-text)]">
                        {t.name}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--kura-text-secondary)]">
                        {truncate(t.address)} · {t.source}
                      </span>
                    </span>
                    {selected ? <Check className="h-3.5 w-3.5 text-[var(--kura-primary)]" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
