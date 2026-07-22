"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ANNUAL_BILLING_DISCOUNT_PERCENT,
  getPlanDisplayPrice,
  PLAN_DEFINITIONS,
  type PlanDefinition,
} from '@/config/plans';
import { createStripeCheckoutSession, StripeBillingCycle, StripePlanId } from '@/lib/stripeApi';
import { env } from '@/config/env';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanTier: StripePlanId;
}

const STRIPE_PRICE_ID_MAP: Record<Exclude<StripePlanId, 'basic'>, Record<StripeBillingCycle, string | undefined>> = {
  pro: {
    monthly: env.stripePrices.proMonthly,
    annually: env.stripePrices.proYearly,
  },
  ultimate: {
    monthly: env.stripePrices.ultimateMonthly,
    annually: env.stripePrices.ultimateYearly,
  },
};

export default function PlansModal({ isOpen, onClose, currentPlanTier }: PlansModalProps) {
  const [billingCycle, setBillingCycle] = useState<StripeBillingCycle>('monthly');
  const [submittingPlanId, setSubmittingPlanId] = useState<StripePlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const plans = useMemo(
    () =>
      PLAN_DEFINITIONS.map((plan) => ({
        ...plan,
        displayPriceLabel: getPlanDisplayPrice(plan, billingCycle),
      })),
    [billingCycle],
  );

  const resolvePriceId = (plan: PlanDefinition): string => {
    if (plan.id === 'basic') {
      throw new Error('Basic plan does not require checkout.');
    }

    const priceId = STRIPE_PRICE_ID_MAP[plan.id][billingCycle];
    if (!priceId) {
      throw new Error(`Missing Stripe price ID for ${plan.id} (${billingCycle}).`);
    }
    return priceId;
  };

  const handlePlanAction = async (plan: PlanDefinition) => {
    if (!plan.requiresCheckout) {
      onClose();
      return;
    }

    if (plan.id === currentPlanTier) return;

    try {
      setErrorMessage('');
      setSubmittingPlanId(plan.id);

      const pageUrl = window.location.href;
      const checkoutUrl = await createStripeCheckoutSession({
        priceId: resolvePriceId(plan),
        successUrl: pageUrl,
        cancelUrl: pageUrl,
      });

      window.location.assign(checkoutUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout session.';
      setErrorMessage(message);
    } finally {
      setSubmittingPlanId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close plans modal"
      />

      <div className="relative w-full max-w-5xl rounded-2xl border border-[var(--kura-border)] bg-[var(--kura-bg-light)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--kura-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold text-[var(--kura-text)]">Choose a Plan</h2>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[var(--kura-border)] bg-[var(--kura-surface)] p-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-[var(--kura-primary)] text-white'
                    : 'text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]'
                }`}
              >
                Pay monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annually')}
                className={`ml-1 px-3 py-1.5 rounded-md text-xs transition-colors ${
                  billingCycle === 'annually'
                    ? 'bg-[var(--kura-primary)] text-white'
                    : 'text-[var(--kura-text-secondary)] hover:text-[var(--kura-text)]'
                }`}
              >
                Pay annually (-{ANNUAL_BILLING_DISCOUNT_PERCENT}%)
              </button>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              ×
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {plans.map((plan) => (
            <section
              key={plan.name}
              className={`p-5 border-r border-[var(--kura-border)] last:border-r-0 ${
                plan.highlighted ? 'bg-[var(--kura-primary)]/5' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[var(--kura-text)]">{plan.name}</h3>
                {plan.badge ? (
                  <Badge className="bg-[var(--kura-primary)]/15 text-[var(--kura-primary)] border-[var(--kura-primary)]/30">
                    {plan.badge}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-2xl font-bold text-[var(--kura-text)]">{plan.displayPriceLabel}</p>
              <p className="mt-2 text-sm text-[var(--kura-text-secondary)]">{plan.summary}</p>

              <Button
                className="w-full mt-4"
                onClick={() => void handlePlanAction(plan)}
                disabled={submittingPlanId !== null || plan.id === currentPlanTier}
              >
                {plan.id === currentPlanTier
                  ? 'Current Plan'
                  : submittingPlanId === plan.id
                    ? 'Redirecting...'
                    : plan.ctaLabel}
              </Button>

              <ul className="mt-4 space-y-3 border-t border-[var(--kura-border)] pt-4">
                {plan.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-2 text-sm text-[var(--kura-text)]">
                    <span className="text-[var(--kura-success)] mt-0.5">✓</span>
                    <span>
                      <span className="font-medium">{feature.title}</span>
                      {feature.description ? (
                        <span className="block text-xs text-[var(--kura-text-secondary)] mt-0.5">
                          {feature.description}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        {errorMessage && (
          <div className="border-t border-[var(--kura-border)] px-5 py-3 text-sm text-[var(--kura-error)]">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}
