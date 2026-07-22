"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FinalCTA() {
  return (
    <section className="py-20 md:py-28 border-t border-[var(--kura-border)]">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight text-[var(--kura-text)] mb-5">
            The future of money starts here.
          </h2>
          <p className="text-lg text-[var(--kura-text-secondary)] leading-relaxed mb-10">
            Join Kura and experience finance designed for the internet generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/download"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--kura-primary)] px-7 text-[15px] font-medium text-white transition-transform hover:scale-[1.02] hover:bg-[var(--kura-primary-dark)]"
            >
              Download Kura
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--kura-border)] bg-[var(--kura-surface)] px-7 text-[15px] font-medium text-[var(--kura-text)] hover:bg-[var(--kura-bg-light)] transition-colors"
            >
              Log in to web
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
