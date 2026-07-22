import React from 'react';

interface SettingsInputFieldProps {
  label: string;
  type?: 'text' | 'email';
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
  autoComplete?: string;
  name?: string;
}

export default function SettingsInputField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  helperText,
  autoComplete,
  name,
}: SettingsInputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--kura-text-secondary)]">
        {label}
      </label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className={`w-full rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] px-4 py-3 transition-all ${
          disabled
            ? 'cursor-not-allowed text-[var(--kura-text-secondary)] opacity-70'
            : 'text-[var(--kura-text)] focus:border-[var(--kura-primary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--kura-primary)]/50'
        }`}
      />
      {helperText ? (
        <p className="mt-2 text-xs text-[var(--kura-text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
}
