// dashboard 側邊導覽元件
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

export default function Sidebar() {
  const pathname = usePathname() || '';

  // 判斷當前路由以切換高亮狀態
  const isHome = pathname === '/dashboard';
  const isAccounts = pathname.includes('/dashboard/accounts');
  const isTransactions = pathname.includes('/dashboard/transactions');
  const isInvestment = pathname.includes('/dashboard/investment');
  const isDefiProtocol = pathname.includes('/dashboard/defi-protocol');
  const isBudget = pathname.includes('/dashboard/budget');
  const isImpermanentLoss = pathname.includes('/dashboard/impermanent-loss');
  const isTaxCalculator = pathname.includes('/dashboard/tax-calculator');

  return (
    <nav className="relative z-10 w-56 border-r border-[var(--kura-border)] bg-[var(--kura-bg-light)] py-6 px-2 flex flex-col gap-0 shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden">
      
      {/* 首頁 */}
      <NavLink href="/dashboard" label="Home" isActive={isHome} />
      
      {/* 分隔線 */}
      <Separator className="my-3" />

      {/* 主要區段 */}
      <div className="space-y-2 mb-3">
        <NavLink href="/dashboard/accounts" label="Accounts" isActive={isAccounts} />
        <NavLink href="/dashboard/transactions" label="Transactions" isActive={isTransactions} />
        <NavLink href="/dashboard/investment" label="Investment" isActive={isInvestment} />
        <NavLink href="/dashboard/defi-protocol" label="DeFi Protocol" isActive={isDefiProtocol} />
      </div>

      {/* 分隔線 */}
      <Separator className="my-3" />

      {/* 次要區段 */}
      <div className="space-y-2">
        <NavLink href="/dashboard/budget" label="Budget" isActive={isBudget} />
        <NavLink href="/dashboard/impermanent-loss" label="Impermanent Loss" isActive={isImpermanentLoss} />
        <NavLink href="/dashboard/tax-calculator" label="Tax Calculator" isActive={isTaxCalculator} />
      </div>

    </nav>
  );
}