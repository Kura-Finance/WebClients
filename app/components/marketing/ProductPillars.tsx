"use client";

import { motion } from "framer-motion";

const PILLARS = [
  {
    num: "01",
    title: "Cash",
    body: "Move money globally with bank transfers and digital dollars.",
  },
  {
    num: "02",
    title: "Invest",
    body: "Access US stocks and digital assets in one place.",
  },
  {
    num: "03",
    title: "Earn",
    body: "Put idle cash to work with transparent yield strategies.",
  },
  {
    num: "04",
    title: "Borrow",
    body: "Access liquidity through Morpho markets with clear rates and collateral terms.",
  },
  {
    num: "05",
    title: "Spend",
    body: "Use your balance like a modern financial account.",
  },
] as const;

export default function ProductPillars() {
  return (
    <section id="product" className="py-20 md:py-28 border-t border-[var(--kura-border)]">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl mb-14"
        >
          <p className="text-sm font-medium text-[var(--kura-primary-dark)] mb-3">Product</p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--kura-text)]">
            Everything your money needs.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {PILLARS.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <p className="text-xs font-medium tracking-widest text-[var(--kura-text-secondary)] mb-3">
                {item.num}
              </p>
              <h3 className="text-xl font-semibold tracking-tight text-[var(--kura-text)] mb-2">
                {item.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-[var(--kura-text-secondary)]">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
