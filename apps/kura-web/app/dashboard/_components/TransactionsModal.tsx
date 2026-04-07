// src/app/dashboard/_components/TransactionsModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../store/useFinanceStore';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accountName: string;
}

export default function TransactionsModal({ isOpen, onClose, transactions, accountName }: TransactionsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredTransactions = transactions.filter(tx => 
    tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="modal-wrapper"
          className="fixed inset-0 z-[9999] flex items-end justify-center"
        >
          {/* 背景毛玻璃遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 底部抽屜本體 */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-4xl h-[85vh] bg-[#0B0B0F] border-t border-x border-white/10 rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* 頂部把手 */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* 標題與關閉按鈕 */}
            <div className="px-8 pb-6 flex justify-between items-center border-b border-white/5 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {accountName === 'All Accounts' ? 'All Transactions' : accountName}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {accountName === 'All Accounts' ? 'Across all linked accounts' : 'Transaction history'}
                </p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#1A1A24] flex justify-center items-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            {/* 搜尋列 */}
            <div className="px-8 py-6 flex gap-4 shrink-0 bg-[#0B0B0F] z-10 border-b border-white/5">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                <input 
                  type="text" 
                  name="transaction-search"
                  autoComplete="off"
                  placeholder="Search merchants, categories..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1A1A24] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all"
                />
              </div>
              <button className="px-6 py-3 bg-[#1A1A24] border border-white/5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <span>⚙️</span> Filter
              </button>
            </div>

            {/* 交易列表 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-4 hide-scrollbar">
              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {filteredTransactions.map((tx) => {
                    const isExpense = tx.type === 'credit' || tx.type === 'transfer';
                    return (
                      <div key={tx.id} className="flex w-full min-w-0 justify-between items-center py-5 hover:bg-white/[0.02] px-3 rounded-xl transition-colors group">
                        <div className="flex min-w-0 items-center gap-5">
                          <div className="w-12 h-12 rounded-full bg-[#1A1A24] flex items-center justify-center border border-white/5 group-hover:border-[#8B5CF6]/30 transition-colors">
                            {tx.type === 'deposit' ? '💰' : tx.type === 'transfer' ? '🔄' : '🛍️'}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-white font-medium text-lg mb-1 group-hover:text-[#A78BFA] transition-colors">{tx.merchant}</div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500">{tx.date}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-700" />
                              <span className="truncate text-gray-400 bg-[#1A1A24] px-2 py-0.5 rounded-md text-xs">{tx.category}</span>
                              <span className={`truncate px-2 py-0.5 rounded-md text-xs uppercase tracking-wider ${tx.accountType === 'saving' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-gray-400'}`}>
                                {tx.accountType === 'saving' ? 'Savings' : tx.accountType === 'checking' ? 'Checking' : tx.accountType === 'credit' ? 'Credit' : 'Crypto'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`shrink-0 pl-3 font-mono text-lg font-medium ${isExpense ? 'text-white' : 'text-green-400'}`}>
                          {isExpense ? '-' : '+'}${tx.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  {searchTerm ? `No transactions found for "${searchTerm}"` : 'No transactions available yet.'}
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}