"use client";

/** Lightweight metal card preview for waitlist (aligned with mobile MetalCard look). */
export default function MetalCardPreview() {
  return (
    <div className="relative w-full aspect-[1.6/1] max-w-md mx-auto">
      <div
        className="absolute inset-0 rounded-3xl overflow-hidden p-6 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        style={{
          background:
            "linear-gradient(145deg, #3a3a3c 0%, #1c1c1e 40%, #2c2c2e 70%, #0a0a0a 100%)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.25) 0%, transparent 45%, rgba(180,83,9,0.15) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between text-[#F5F5F7]">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold tracking-wide">Kura Premier</span>
            <span className="rounded-md bg-[#B45309]/90 px-2.5 py-1 text-[11px] font-extrabold tracking-[2px] text-white">
              VISA
            </span>
          </div>
          <div>
            <div className="mb-4 h-7 w-10 rounded-[5px] border border-[#be9e46]/50 bg-[#be9e46]/25" />
            <p className="font-mono text-base tracking-[0.25em] text-[#D1D1D6]">
              ••••  ••••  ••••  ••••
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8.5px] uppercase tracking-wide text-[#8E8E93]">Card Holder</p>
              <p className="text-xs font-semibold tracking-wide">KURA MEMBER</p>
            </div>
            <p className="text-[10px] font-medium text-[#B45309]">Metal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
