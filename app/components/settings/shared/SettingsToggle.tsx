import React from 'react';

interface SettingsToggleProps {
  checked: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function SettingsToggle({ checked, onClick, disabled = false }: SettingsToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? 'bg-[var(--kura-primary)]'
          : 'border border-[var(--kura-border)] bg-[var(--kura-bg-lighter)]'
      }`}
    >
      <div
        className={`absolute top-1 h-4 w-4 rounded-full bg-[var(--kura-surface)] shadow-md transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
