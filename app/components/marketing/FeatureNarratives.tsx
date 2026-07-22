"use client";

import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "See every account in one place",
    body: "Link banks, brokerages, and wallets. TrackFi keeps your portfolio readable without hopping between apps.",
  },
  {
    title: "Spend with a modern card",
    body: "Issue a virtual Kura Card for everyday payments—built for the same balance you save and earn with.",
  },
  {
    title: "Move money without the patchwork",
    body: "Global transfers and digital dollars in one flow. Less waiting, fewer tabs, clearer status.",
  },
] as const;

export default function FeatureNarratives() {
  return (
    <section className="py-20 md:py-28 bg-[var(--kura-bg-light)]">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--kura-text)] mb-4">
            Banking&apos;s been a headache.
            <br />
            Now it&apos;s a head start.
          </h2>
          <p className="text-[var(--kura-text-secondary)] text-lg leading-relaxed">
            Built as software first—so everyday money tasks take seconds, not office hours.
          </p>
        </motion.div>

        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-12">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="border-t border-[var(--kura-border)] pt-6"
            >
              <h3 className="text-lg font-semibold tracking-tight text-[var(--kura-text)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-[var(--kura-text-secondary)]">
                {feature.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
