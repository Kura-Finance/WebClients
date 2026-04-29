"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? 'secondary' : 'ghost'}
      className={`w-full justify-start ${isActive ? 'text-[var(--kura-primary)] border-[var(--kura-primary)]/40 bg-[var(--kura-primary)]/15' : 'text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]'}`}
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
}

export default function AppSidebar() {
  const pathname = usePathname() || '';
  const isSettingsRoute = pathname.startsWith('/settings');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!isDashboardRoute && !isSettingsRoute) {
    return null;
  }

  const dashboardLinks = [
    { href: '/dashboard', label: 'Home' },
    { href: '/dashboard/accounts', label: 'Accounts' },
    { href: '/dashboard/transactions', label: 'Transactions' },
    { href: '/dashboard/investment', label: 'Investment' },
    { href: '/dashboard/defi-protocol', label: 'DeFi Protocol' },
    { href: '/dashboard/budget', label: 'Budget' },
    { href: '/dashboard/impermanent-loss', label: 'Impermanent Loss' },
    { href: '/dashboard/tax-calculator', label: 'Tax Calculator' },
  ];

  const settingsLinks = [
    { href: '/settings/profile', label: 'Profile' },
    { href: '/settings/security', label: 'Security' },
    { href: '/settings/plan-billing', label: 'Plan & Billing' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="relative z-10 w-56 border-r border-[var(--kura-border)] bg-[var(--kura-bg-light)] py-6 px-2 flex flex-col gap-0 shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden">
      {isDashboardRoute ? (
        <>
          <NavLink href={dashboardLinks[0].href} label={dashboardLinks[0].label} isActive={isActive(dashboardLinks[0].href)} />
          <Separator className="my-3" />
          <div className="space-y-2 mb-3">
            {dashboardLinks.slice(1, 5).map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={isActive(link.href)} />
            ))}
          </div>
          <Separator className="my-3" />
          <div className="space-y-2">
            {dashboardLinks.slice(5).map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={isActive(link.href)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <Link
            href="/dashboard"
            className="flex h-12 w-full items-center gap-3 px-4 text-[var(--kura-text-secondary)] transition-colors hover:text-[var(--kura-text)]"
          >
            <span className="text-3xl leading-none">‹</span>
            <span className="text-[2rem] font-medium tracking-tight">Dashboard</span>
          </Link>
          <Separator className="my-3" />
          <div className="space-y-2">
            {settingsLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} isActive={isActive(link.href)} />
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
