// 偏好設定檢視
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import SettingsSection from './shared/SettingsSection';

export default function PreferencesView({ variants }: { variants: Variants }) {
  const preferences = useAppStore(state => state.preferences);
  const setBaseCurrency = useAppStore(state => state.setBaseCurrency);

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }} className="absolute inset-0 space-y-8 px-6 py-6">
      <SettingsSection title="Display">
        <div className="flex items-center justify-between rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4">
          <div className="font-medium text-[var(--kura-text)]">Base Currency</div>
          <select
            value={preferences.baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value as 'USD' | 'EUR' | 'TWD')}
            className="cursor-pointer bg-transparent text-right font-medium text-[var(--kura-primary-light)] focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="TWD">TWD (NT$)</option>
          </select>
        </div>
      </SettingsSection>
    </motion.div>
  );
}
