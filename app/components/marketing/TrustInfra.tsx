"use client";

import { motion } from "framer-motion";

const PARTNERS = ["Circle", "Base", "Dinari", "Morpho", "MoonPay", "Bridge"] as const;

export default function TrustInfra() {
  return (
    <section id="trust" className="py-20 md:py-28 bg-[var(--kura-bg-light)]">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl mb-12"
        >
          <p className="text-sm font-medium text-[var(--kura-primary-dark)] mb-3">Infrastructure</p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--kura-text)] mb-4">
            One experience. Powered by the best infrastructure.
          </h2>
          <p className="text-[var(--kura-text-secondary)] text-lg leading-relaxed">
            Kura combines leading financial infrastructure behind one simple interface—so you
            never need to think about what&apos;s happening behind the scenes.
          </p>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-x-8 gap-y-4"
        >
          {PARTNERS.map((name) => (
            <li
              key={name}
              className="text-sm font-medium tracking-wide text-[var(--kura-text-secondary)] uppercase"
            >
              {name}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
