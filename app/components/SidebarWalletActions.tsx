"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";

/**
 * Sidebar footer actions — Transfer · Add Money.
 */
export default function SidebarWalletActions() {
  const pathname = usePathname() || "";
  const transferActive = pathname === "/dashboard/payment" || pathname.startsWith("/dashboard/payment/");
  const addMoneyActive =
    pathname === "/dashboard/add-money" || pathname.startsWith("/dashboard/add-money/");

  return (
    <div className="mt-auto border-t border-[var(--kura-border)] pt-3 px-1 space-y-2">
      <Link
        href="/dashboard/payment"
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors ${
          transferActive
            ? "border-[var(--kura-primary)]/40 bg-[var(--kura-primary)]/12 text-[var(--kura-primary-light)]"
            : "border-[var(--kura-border)] bg-[var(--kura-surface)] text-[var(--kura-text)] hover:bg-[var(--kura-bg-lighter)]"
        }`}
      >
        <ArrowUpRight className="h-4 w-4" />
        Transfer
      </Link>
      <Link
        href="/dashboard/add-money"
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors ${
          addMoneyActive
            ? "bg-[var(--kura-primary-dark)] text-white"
            : "bg-[var(--kura-primary)] text-white hover:bg-[var(--kura-primary-dark)]"
        }`}
      >
        <Plus className="h-4 w-4" />
        Add Money
      </Link>
    </div>
  );
}
