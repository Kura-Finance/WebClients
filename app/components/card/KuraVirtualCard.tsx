"use client";

import React from 'react';

export type CardOverlay =
  | { type: 'get_card'; onPress: () => void; isLoading?: boolean }
  | { type: 'pending'; onResume?: () => void; isLoading?: boolean }
  | { type: 'under_review' }
  | { type: 'rejected'; reason?: string | null; onRetry?: () => void };

interface KuraVirtualCardProps {
  /** 顯示在 BALANCE 欄位（如 "Kura Card ····4242"）。 */
  balance?: string;
  masked?: boolean;
  last4?: string;
  overlay?: CardOverlay;
}

/**
 * 網頁版 Kura 虛擬卡（對齊 react-native VirtualCard 的視覺）。
 * 純 CSS 漸層卡面，含 VISA、晶片、卡號、持卡人 / 到期 / 餘額。
 */
export default function KuraVirtualCard({ balance, masked = true, last4, overlay }: KuraVirtualCardProps) {
  return (
    <div className="relative w-full aspect-[1.6/1] max-w-md">
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden p-6 shadow-[0_16px_40px_rgba(80,70,120,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F2F2F7 40%, #E8E8ED 70%, #F5F5F8 100%)',
        }}
      >
        {/* glossy sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(120deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 45%, rgba(200,200,210,0.25) 100%)',
          }}
        />
        {/* brand blob */}
        <div className="absolute -top-10 -left-6 w-32 h-32 rounded-full bg-gradient-to-br from-[#8B5CF6]/30 to-[#6366F1]/10 blur-2xl" />

        <div className="relative flex h-full flex-col justify-between text-[#1C1C28]">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold tracking-wide text-[#3A3A48]">Kura</span>
            <span className="rounded-md bg-[#1c1c24]/80 px-2.5 py-1 text-[11px] font-extrabold tracking-[2px] text-white">
              VISA
            </span>
          </div>

          <div>
            <div className="mb-4 h-7 w-10 rounded-[5px] border border-[#be9e46]/45 bg-[#be9e46]/20" />
            <p className="font-mono text-base tracking-[0.25em] text-[#3A3A48]">
              {masked ? '••••  ••••  ••••  ' + (last4 ?? '••••') : '4242 4242 4242 ' + (last4 ?? '4242')}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8.5px] uppercase tracking-wide text-[#A0A8B8]">Card Holder</p>
              <p className="text-xs font-semibold">Kura Member</p>
            </div>
            <div className="text-right">
              <p className="text-[8.5px] uppercase tracking-wide text-[#A0A8B8]">Expires</p>
              <p className="text-xs font-semibold">12/28</p>
            </div>
            <div className="text-right">
              <p className="text-[8.5px] uppercase tracking-wide text-[#A0A8B8]">Balance</p>
              <p className="text-xs font-semibold text-[#6D28D9]">{balance ?? '••••'}</p>
            </div>
          </div>
        </div>

        {overlay && <CardOverlayContent overlay={overlay} />}
      </div>
    </div>
  );
}

function CardOverlayContent({ overlay }: { overlay: CardOverlay }) {
  const baseBg =
    overlay.type === 'rejected'
      ? 'bg-gradient-to-br from-red-500/60 to-red-900/70'
      : 'bg-gradient-to-br from-black/55 to-black/70';

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl ${baseBg}`}>
      {overlay.type === 'get_card' && (
        <button
          onClick={overlay.onPress}
          disabled={overlay.isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] px-5 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-70"
        >
          {overlay.isLoading ? 'Loading…' : 'Get Card'}
        </button>
      )}

      {(overlay.type === 'pending' || overlay.type === 'under_review') && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold text-amber-300">Under Review</p>
          <p className="max-w-[220px] text-[11px] text-white/70">
            Identity verification in progress — usually 1–2 business days.
          </p>
          {overlay.type === 'pending' && overlay.onResume && (
            <button
              onClick={overlay.onResume}
              className="mt-3 rounded-xl bg-amber-500/90 px-4 py-2 text-xs font-bold text-white"
            >
              Resume
            </button>
          )}
        </div>
      )}

      {overlay.type === 'rejected' && (
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-sm font-bold text-red-200">Verification Failed</p>
          <p className="max-w-[220px] text-[11px] text-white/70">{overlay.reason || 'Please contact support.'}</p>
          {overlay.onRetry && (
            <button
              onClick={overlay.onRetry}
              className="mt-3 rounded-xl bg-red-500/90 px-4 py-2 text-xs font-bold text-white"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
