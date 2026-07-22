import { requestJson } from './httpClient';

export type StripeBillingCycle = 'monthly' | 'annually';
export type StripePlanId = 'basic' | 'pro' | 'ultimate';

interface CheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface BillingPortalSessionRequest {
  returnUrl: string;
}

export interface StripeBillingStatus {
  tier?: string;
  hasActiveSubscription?: boolean;
  /** @deprecated use hasActiveSubscription */
  isActive?: boolean;
  planId?: string;
  membershipLabel?: string;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

type UrlLikeResponse = {
  url?: string;
  sessionUrl?: string;
  checkoutUrl?: string;
  billingPortalUrl?: string;
  /** Backend StripeService.createBillingPortalSession */
  portalUrl?: string;
};

function extractRedirectUrl(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new Error("Stripe API response is invalid.");
  }

  const candidate = payload as UrlLikeResponse;
  const url =
    candidate.url ||
    candidate.checkoutUrl ||
    candidate.sessionUrl ||
    candidate.portalUrl ||
    candidate.billingPortalUrl;

  if (!url || typeof url !== "string") {
    throw new Error("Stripe API response does not include redirect URL.");
  }

  return url;
}

export const createStripeCheckoutSession = async (payload: CheckoutSessionRequest): Promise<string> => {
  const response = await requestJson<unknown>(
    '/api/stripe/checkout-session',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'StripeAPI',
  );
  return extractRedirectUrl(response);
};

export const createStripeBillingPortalSession = async (
  payload: BillingPortalSessionRequest,
): Promise<string> => {
  const response = await requestJson<unknown>(
    '/api/stripe/billing-portal-session',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    'StripeAPI',
  );
  return extractRedirectUrl(response);
};

export const fetchStripeBillingStatus = (): Promise<StripeBillingStatus> => {
  return requestJson<StripeBillingStatus>('/api/stripe/billing-status', { method: 'GET' }, 'StripeAPI');
};
