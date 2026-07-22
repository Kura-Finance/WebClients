"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Briefcase,
  TrendingUp,
  ChartCandlestick,
  Coins,
  HandCoins,
  Landmark,
  LineChart,
  Blocks,
  Vault,
  ShieldCheck,
  Users,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import SidebarWalletActions from "@/components/SidebarWalletActions";

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
  icon?: LucideIcon;
}

function NavLink({ href, label, isActive, icon: Icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
        isActive
          ? "bg-[var(--kura-primary)]/12 text-[var(--kura-primary-light)]"
          : "text-[var(--kura-text-secondary)] hover:bg-[var(--kura-bg-lighter)] hover:text-[var(--kura-text)]"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" /> : null}
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--kura-text-secondary)]/80">
      {children}
    </p>
  );
}

function NavDivider() {
  return <div className="mx-3 my-1 border-t border-[var(--kura-border)]" role="separator" />;
}

const MAIN_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/card", label: "Card", icon: CreditCard },
  { href: "/dashboard/crypto", label: "Portfolio", icon: Briefcase },
];

const PRODUCT_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/earn", label: "Earn", icon: TrendingUp },
  { href: "/dashboard/rwa", label: "Tokenized Stock", icon: ChartCandlestick },
  { href: "/dashboard/markets", label: "Crypto", icon: Coins },
  { href: "/dashboard/borrow", label: "Borrow", icon: HandCoins },
];

const ORG_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/treasury", label: "Treasury", icon: Vault },
  { href: "/dashboard/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/report", label: "Report", icon: FileBarChart },
];

const TRACKFI_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/accounts", label: "Bank", icon: Landmark },
  { href: "/dashboard/investment", label: "Broker", icon: LineChart },
  { href: "/dashboard/defi-protocol", label: "DeFi", icon: Blocks },
];

const SETTINGS_LINKS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/security", label: "Security" },
  { href: "/settings/plan-billing", label: "Plan & Billing" },
] as const;

export default function AppSidebar() {
  const pathname = usePathname() || "";
  const isSettingsRoute = pathname.startsWith("/settings");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isDashboardRoute && !isSettingsRoute) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="relative z-10 w-56 border-r border-[var(--kura-border)] bg-[var(--kura-bg)] py-5 px-3 flex flex-col gap-1 shrink-0 h-full overflow-y-auto hide-scrollbar">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-3">
        <Image src="/logo.webp" alt="Kura" width={24} height={24} className="rounded-md" />
        <span className="text-sm font-semibold tracking-tight text-[var(--kura-text)]">Kura</span>
      </Link>

      {isDashboardRoute ? (
        <>
          <div className="space-y-0.5">
            {MAIN_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive(link.href)}
              />
            ))}
          </div>

          <NavDivider />

          <div className="space-y-0.5">
            {PRODUCT_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive(link.href)}
              />
            ))}
          </div>

          <NavDivider />

          <div className="space-y-0.5">
            {ORG_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive(link.href)}
              />
            ))}
          </div>

          <NavDivider />

          <div className="space-y-0.5">
            {TRACKFI_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={isActive(link.href)}
              />
            ))}
          </div>

          <SidebarWalletActions />
        </>
      ) : (
        <>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)] transition-colors"
          >
            <span className="text-lg leading-none">‹</span>
            Dashboard
          </Link>
          <div className="mt-2">
            <SectionLabel>Settings</SectionLabel>
            <div className="space-y-0.5">
              {SETTINGS_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  isActive={isActive(link.href)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
