"use client";

import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const noopSubscribe = () => () => {};

/** SSR 安全的「已掛載至客戶端」判斷，避免在 effect 內 setState。 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** Tailwind max-width class. */
  maxWidthClassName?: string;
}

/**
 * 通用彈窗外殼（portal + 背景遮罩 + framer-motion 動畫），沿用 ConnectAccountModal 風格。
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClassName = 'max-w-md',
}: ModalProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full ${maxWidthClassName} max-h-[90vh] overflow-y-auto hide-scrollbar bg-[var(--kura-bg-light)] border border-[var(--kura-border)] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col`}
          >
            {(title || description) && (
              <div className="p-6 border-b border-[var(--kura-border-light)] flex justify-between items-start gap-4">
                <div>
                  {title && <h2 className="text-xl font-bold text-[var(--kura-text)]">{title}</h2>}
                  {description && <p className="text-sm text-[var(--kura-text-secondary)] mt-1">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full bg-[var(--kura-surface-strong)] flex justify-center items-center text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)] transition-colors shrink-0"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
