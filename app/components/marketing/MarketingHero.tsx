"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 20% 0%, rgba(139,92,246,0.08), transparent 55%)",
        }}
      />

      <div className="marketing-container relative grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-16 items-center pt-20 pb-16 md:pt-28 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="text-sm font-medium tracking-wide text-[var(--kura-primary-dark)] mb-5">
            Kura
          </p>
          <h1 className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] leading-[1.05] tracking-[-0.03em] text-[var(--kura-text)] mb-6">
            Modern finance,
            <br />
            redesigned.
          </h1>
          <p className="text-lg text-[var(--kura-text-secondary)] leading-relaxed mb-10 max-w-md">
            One account to save, spend, invest, earn, and move money globally—with the
            simplicity of a bank and the freedom of modern finance.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--kura-primary)] px-7 text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(139,92,246,0.28)] transition-transform hover:scale-[1.02] hover:bg-[var(--kura-primary-dark)]"
            >
              Get started
            </Link>
            <Link
              href="/download"
              className="group inline-flex h-12 items-center justify-center gap-2 px-2 text-[15px] font-medium text-[var(--kura-text)]"
            >
              Download app
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[280px] sm:max-w-[300px] lg:max-w-[320px]">
            <div
              className="absolute -inset-8 rounded-[40%] bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_70%)] blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[36px] bg-[#e1e4ec] shadow-[0_32px_80px_rgba(18,19,26,0.12),0_8px_24px_rgba(139,92,246,0.08)] ring-[3px] ring-[#d4d8e4]">
              <Image
                src="/screenshot.webp"
                alt="Kura app home screen"
                width={1206}
                height={2622}
                priority
                className="w-full h-auto block"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
