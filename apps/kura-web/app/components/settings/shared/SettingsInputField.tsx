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
  const defaultClasses = 'w-full bg-[#1A1A24] border border-white/5 rounded-xl py-3 px-4 transition-all';
  const enabledClasses = 'text-white focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50';
  const disabledClasses = 'text-gray-400 cursor-not-allowed opacity-70';

  return (
    <div>
      <label className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2 block">{label}</label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`${defaultClasses} ${disabled ? disabledClasses : enabledClasses}`}
        disabled={disabled}
      />
      {helperText ? <p className="text-xs text-gray-500 mt-2">{helperText}</p> : null}
    </div>
  );
}
