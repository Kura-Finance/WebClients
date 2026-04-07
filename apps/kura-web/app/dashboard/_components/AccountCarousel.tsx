import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Reorder } from 'framer-motion';
import { Account } from '../../store/useFinanceStore';

interface AccountCarouselProps {
  accounts: Account[];
  totalBalance: number;
  selectedId: string;
  onAccountSelect: (id: string) => void;
  onConnectAccount: () => void;
  onAccountsReorder: (accounts: Account[]) => void;
}

export default function AccountCarousel({
  accounts,
  totalBalance,
  selectedId,
  onAccountSelect,
  onConnectAccount,
  onAccountsReorder,
}: AccountCarouselProps) {
  const [orderedAccountIds, setOrderedAccountIds] = useState<string[]>(accounts.map((account) => account.id));
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const orderedAccountIdsRef = useRef(orderedAccountIds);
  const formattedTotal = `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);

  const orderedAccounts = useMemo(
    () => orderedAccountIds.map((accountId) => accountsById.get(accountId)).filter((account): account is Account => Boolean(account)),
    [accountsById, orderedAccountIds]
  );
  const activeCardId = draggingCardId || hoveredCardId;
  const baseTopZIndex = orderedAccounts.length + 3;
  const overviewStackLevel = activeCardId === 'all' ? baseTopZIndex + 2 : 0;
  const groupStackLevel = activeCardId && activeCardId !== 'all' ? baseTopZIndex + 1 : baseTopZIndex;

  useEffect(() => {
    const nextAccountIds = accounts.map((account) => account.id);
    setOrderedAccountIds((currentIds) => {
      const nextIdsInCurrentOrder = currentIds.filter((accountId) => nextAccountIds.includes(accountId));
      const missingIds = nextAccountIds.filter((accountId) => !currentIds.includes(accountId));
      const mergedIds = [...nextIdsInCurrentOrder, ...missingIds];
      const nextIds = mergedIds.length === nextAccountIds.length ? mergedIds : nextAccountIds;
      orderedAccountIdsRef.current = nextIds;
      return nextIds;
    });
  }, [accounts]);

  const commitOrder = () => {
    const nextAccounts = orderedAccountIdsRef.current
      .map((accountId) => accountsById.get(accountId))
      .filter((account): account is Account => Boolean(account));

    onAccountsReorder(nextAccounts);
  };

  return (
    <div className="relative z-40 w-full mb-10 overflow-visible">
      <div className="flex items-center gap-3 px-6 pt-2 pb-2 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500">
        <span>Drag cards to reorder</span>
      </div>
      <div className="flex overflow-x-auto overflow-y-visible snap-x snap-mandatory pb-10 pt-6 pl-6 pr-4 hide-scrollbar -space-x-6">
        
        {/* 總覽卡片 */}
        <div 
          onClick={() => onAccountSelect('all')}
          onMouseEnter={() => setHoveredCardId('all')}
          onMouseLeave={() => setHoveredCardId((current) => (current === 'all' ? null : current))}
          style={{ zIndex: overviewStackLevel }}
          className={`snap-start shrink-0 w-[320px] h-[180px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-150 hover:-translate-y-3 hover:-translate-x-1 hover:rotate-[-2deg] cursor-pointer 
          ${selectedId === 'all' 
            ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] shadow-[0_10px_40px_rgba(139,92,246,0.4)]' 
            : 'bg-[#1A1A24] border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'}`}
        >
          <div className="flex justify-between items-center">
            <div className={`text-xs font-bold tracking-widest uppercase ${selectedId === 'all' ? 'text-white/80' : 'text-white/50'}`}>
              OVERVIEW
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 ${selectedId === 'all' ? 'bg-white/20' : ''}`}>
              <span className="text-xl">✨</span>
            </div>
          </div>
          <div>
            <div className="text-white text-4xl font-bold tracking-tight mb-1">
              {formattedTotal}
            </div>
            <div className={`font-medium ${selectedId === 'all' ? 'text-white/90' : 'text-gray-400'}`}>
              Net Net Worth
            </div>
          </div>
        </div>

        {/* 個別帳戶卡片 */}
        <Reorder.Group
          axis="x"
          values={orderedAccountIds}
          onReorder={(nextAccountIds) => {
            orderedAccountIdsRef.current = nextAccountIds;
            setOrderedAccountIds(nextAccountIds);
          }}
          className="relative flex overflow-visible -space-x-6"
          style={{ zIndex: groupStackLevel }}
        >
        {orderedAccounts.map((account, index) => {
          let topLabel = '';
          let displayBalance = '';

          if (account.type === 'checking' || account.type === 'saving') {
            topLabel = 'BALANCE';
            displayBalance = `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          } else if (account.type === 'credit') {
            topLabel = 'CREDIT CARD';
            displayBalance = `-$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          } else if (account.type === 'crypto') {
            topLabel = 'CRYPTO';
            displayBalance = `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          }

          const stackLevel = activeCardId === account.id ? baseTopZIndex + 2 : orderedAccounts.length - index + 1;
          const defaultBg = index % 2 === 0 ? 'bg-[#1A1A24]' : 'bg-[#0B0B0F] border border-white/10';

          return (
            <Reorder.Item
              key={account.id} 
              value={account.id}
              onDragStart={() => setDraggingCardId(account.id)}
              onDragEnd={() => {
                setDraggingCardId(null);
                commitOrder();
              }}
              onClick={() => onAccountSelect(account.id)}
              onMouseEnter={() => setHoveredCardId(account.id)}
              onMouseLeave={() => setHoveredCardId((current) => (current === account.id ? null : current))}
              style={{ zIndex: stackLevel }}
              className={`snap-start shrink-0 w-[320px] h-[180px] rounded-3xl p-6 flex flex-col justify-between transition-all duration-150 hover:-translate-y-3 hover:-translate-x-1 hover:rotate-[-2deg] cursor-grab active:cursor-grabbing select-none 
              ${selectedId === account.id 
                ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] shadow-[0_10px_40px_rgba(139,92,246,0.4)]' 
                : `${defaultBg} shadow-[0_10px_40px_rgba(0,0,0,0.5)]`}`}
            >
              <div className="flex justify-between items-center">
                <div className={`text-xs font-bold tracking-widest uppercase ${selectedId === account.id ? 'text-white/80' : 'text-white/50'}`}>
                  {topLabel}
                </div>
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                  <Image src={account.logo} alt={`${account.name} Logo`} width={32} height={32} className="object-contain" />
                </div>
              </div>
              <div>
                <div className="text-white text-4xl font-bold tracking-tight mb-1">
                  {displayBalance}
                </div>
                <div className={`font-medium ${selectedId === account.id ? 'text-white/90' : 'text-gray-400'}`}>
                  {account.name}
                </div>
              </div>
            </Reorder.Item>
          );
        })}
        </Reorder.Group>

        {/* Plaid 連結按鈕 */}
        <button
          onClick={onConnectAccount}
          className="snap-start shrink-0 w-[320px] h-[180px] rounded-3xl border-2 border-dashed border-[#1A1A24] bg-[#0B0B0F]/50 flex flex-col items-center justify-center transition-all duration-150 hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 group cursor-pointer ml-6 z-0"
        >
          <div className="w-14 h-14 rounded-full bg-[#1A1A24] flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-150 overflow-hidden">
            <Image src="https://www.google.com/s2/favicons?domain=plaid.com&sz=128" alt="Plaid Logo" width={36} height={36} className="object-contain opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-gray-400 font-medium group-hover:text-[#8B5CF6] transition-colors">Connect Account</span>
          <span className="text-xs text-gray-600 mt-2 font-mono uppercase tracking-widest">Powered by Plaid</span>
        </button>

      </div>
    </div>
  );
}