// src/app/dashboard/_components/Sidebar.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className={`block w-full px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        isActive 
          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' 
          : 'text-gray-400 hover:bg-[#1A1A24] hover:text-white'
      }`}
    >
      {label}
    </Link>
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
  const isDid = pathname.includes('/dashboard/did');
  const isKLHS = pathname.includes('/dashboard/klhs');

  return (
    <nav className="relative z-10 w-56 border-r border-[#1A1A24] bg-[#0B0B0F] py-6 px-2 flex flex-col gap-0 shrink-0 transition-all duration-300 ease-in-out h-full overflow-hidden">
      
      {/* Home */}
      <NavLink href="/dashboard" label="Home" isActive={isHome} />
      
      {/* Divider */}
      <div className="my-3 border-t border-gray-800" />

      {/* Main Section */}
      <div className="space-y-2 mb-3">
        <NavLink href="/dashboard/accounts" label="Accounts" isActive={isAccounts} />
        <NavLink href="/dashboard/transactions" label="Transactions" isActive={isTransactions} />
        <NavLink href="/dashboard/investment" label="Investment" isActive={isInvestment} />
        <NavLink href="/dashboard/defi-protocol" label="DeFi Protocol" isActive={isDefiProtocol} />
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-gray-800" />

      {/* Secondary Section */}
      <div className="space-y-2">
        <NavLink href="/dashboard/budget" label="Budget" isActive={isBudget} />
        <NavLink href="/dashboard/impermanent-loss" label="Impermanent Loss" isActive={isImpermanentLoss} />
        <NavLink href="/dashboard/tax-calculator" label="Tax Calculator" isActive={isTaxCalculator} />
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-gray-800" />

      {/* Tertiary Section */}
      <div className="space-y-2">
        <NavLink href="/dashboard/did" label="Kura DID" isActive={isDid} />
        <NavLink href="/dashboard/klhs" label="KLHS" isActive={isKLHS} />
      </div>

    </nav>
  );
}