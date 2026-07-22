import React from 'react';

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--kura-text-secondary)]">
        {title}
      </div>
      {children}
    </section>
  );
}
