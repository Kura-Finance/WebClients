"use client";

import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    title: "Beautiful UI",
    body: "A financial experience people actually enjoy using.",
  },
  {
    title: "Privacy by default",
    body: "Your assets and identity remain under your control—with passkey unlock and end-to-end encryption on the web client.",
  },
  {
    title: "Global access",
    body: "Borderless finance without unnecessary complexity.",
  },
] as const;

export default function PrinciplesStrip() {
  return (
    <section id="principles" className="py-20 md:py-28 border-t border-[var(--kura-border)]">
      <div className="marketing-container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="max-w-xl mb-14"
        >
          <p className="text-sm font-medium text-[var(--kura-primary-dark)] mb-3">Principles</p>
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--kura-text)]">
            Designed for humans.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {PRINCIPLES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <h3 className="text-lg font-semibold text-[var(--kura-text)] mb-2">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-[var(--kura-text-secondary)]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
