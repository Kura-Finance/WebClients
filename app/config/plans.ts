import type { StripeBillingCycle, StripePlanId } from '@/lib/stripeApi';

export interface PlanFeature {
  title: string;
  description?: string;
}

export interface PlanDefinition {
  id: StripePlanId;
  name: string;
  badge?: string;
  summary: string;
  monthlyPriceLabel: string;
  /** Used to derive annual display when no fixed annual label is set. */
  monthlyAmount: number;
  annualPriceLabel?: string;
  features: PlanFeature[];
  ctaLabel: string;
  requiresCheckout: boolean;
  highlighted?: boolean;
}

/** Canonical plan copy aligned with https://kura-finance.com/pricing */
export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'Kura Basic',
    summary: 'Your private finance command center, free forever',
    monthlyPriceLabel: 'Free',
    monthlyAmount: 0,
    ctaLabel: 'Get Started Free',
    requiresCheckout: false,
    features: [
      {
        title: 'Self Custody Wallet',
        description: 'Full self-custody wallet with RWA access included.',
      },
      {
        title: 'Basic Kura Card',
        description: 'Non-custodial Visa debit card for everyday USDC spending.',
      },
      {
        title: 'Zero-Access Core',
        description: 'Encrypted account visibility without server-side raw data exposure.',
      },
      {
        title: 'Multi-Source Sync',
        description: 'Connect fiat and on-chain sources with strict read-only permissions.',
      },
      {
        title: 'Privacy Dashboard',
        description: '30-day private analytics with no ad tracking.',
      },
    ],
  },
  {
    id: 'pro',
    name: 'Kura Pro',
    badge: 'Popular',
    highlighted: true,
    summary: 'Web dashboard, Business & Team, and priority sync',
    monthlyPriceLabel: '$12.99 / mo',
    monthlyAmount: 12.99,
    ctaLabel: 'Get Pro',
    requiresCheckout: true,
    features: [
      {
        title: 'Everything in Basic',
        description: 'All Basic wallet, card, and tracking features included.',
      },
      {
        title: 'Extended History',
        description: '365 days of encrypted data in your privacy dashboard.',
      },
      {
        title: 'Priority Sync',
        description: 'Stay current with 5 manual syncs per day.',
      },
      {
        title: 'Web Dashboard',
        description: 'Full access to markets, research tools, and the desktop web experience.',
      },
      {
        title: 'Business & Team',
        description: 'Shared Treasury, Approvals, Team roles, and Reports on the web.',
      },
    ],
  },
  {
    id: 'ultimate',
    name: 'Kura Ultimate',
    summary: 'The complete Kura experience with premium card benefits',
    monthlyPriceLabel: '$29.99 / mo',
    monthlyAmount: 29.99,
    annualPriceLabel: '$299.99 billed annually (~$25.00/mo)',
    ctaLabel: 'Get Ultimate',
    requiresCheckout: true,
    features: [
      {
        title: 'Everything in Pro',
        description: 'All Pro history, sync, web dashboard, and Business & Team features included.',
      },
      {
        title: 'Enhanced Kura Card Benefits',
        description: 'Priority access to Kura Card waitlist perks and future card tiers.',
      },
    ],
  },
];

export const ANNUAL_BILLING_DISCOUNT_PERCENT = 17;

export function formatAnnualPriceLabel(monthlyAmount: number): string {
  const annualTotal = monthlyAmount * 12 * (1 - ANNUAL_BILLING_DISCOUNT_PERCENT / 100);
  const monthlyEquivalent = annualTotal / 12;
  return `$${annualTotal.toFixed(2)} billed annually (~$${monthlyEquivalent.toFixed(2)}/mo)`;
}

export function getPlanDisplayPrice(plan: PlanDefinition, billingCycle: StripeBillingCycle): string {
  if (billingCycle === 'annually' && plan.monthlyAmount > 0) {
    return plan.annualPriceLabel ?? formatAnnualPriceLabel(plan.monthlyAmount);
  }
  return plan.monthlyPriceLabel;
}

export function getPlanById(id: StripePlanId): PlanDefinition | undefined {
  return PLAN_DEFINITIONS.find((plan) => plan.id === id);
}

export function getPlanFeatures(id: StripePlanId): PlanFeature[] {
  return getPlanById(id)?.features ?? [];
}
