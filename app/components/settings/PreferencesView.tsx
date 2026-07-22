// 偏好設定檢視
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import SettingsSection from './shared/SettingsSection';
import SettingsToggle from './shared/SettingsToggle';

export default function PreferencesView({ variants }: { variants: Variants }) {
  const preferences = useAppStore(state => state.preferences);
  const setBaseCurrency = useAppStore(state => state.setBaseCurrency);
  const toggleLargeTransactionAlerts = useAppStore(state => state.toggleLargeTransactionAlerts);
  const toggleWeeklyAiSummary = useAppStore(state => state.toggleWeeklyAiSummary);

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
      <SettingsSection title="Notifications">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4">
            <div>
              <div className="font-medium text-[var(--kura-text)]">Large Transactions</div>
              <div className="mt-0.5 text-xs text-[var(--kura-text-secondary)]">Alert on spends &gt; $500</div>
            </div>
            <SettingsToggle checked={preferences.largeTransactionAlerts} onClick={toggleLargeTransactionAlerts} />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] p-4">
            <div>
              <div className="font-medium text-[var(--kura-text)]">Weekly AI Summary</div>
              <div className="mt-0.5 text-xs text-[var(--kura-text-secondary)]">Kura&apos;s financial insights via email</div>
            </div>
            <SettingsToggle checked={preferences.weeklyAiSummary} onClick={toggleWeeklyAiSummary} />
          </div>
        </div>
      </SettingsSection>
    </motion.div>
  );
}
