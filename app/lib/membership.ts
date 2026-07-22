export type MembershipTier = 'basic' | 'pro' | 'ultimate' | 'vip';

/** Tiers that unlock the web dashboard (TrackFi). */
const DASHBOARD_TIERS = new Set<MembershipTier>(['pro', 'ultimate', 'vip']);

export function parseMembershipTier(label: string): MembershipTier {
  const normalized = (label || 'basic').toLowerCase();
  if (normalized.includes('ultimate')) return 'ultimate';
  if (normalized.includes('vip')) return 'vip';
  if (normalized.includes('pro')) return 'pro';
  return 'basic';
}

export function hasDashboardMembershipAccess(tier: MembershipTier): boolean {
  return DASHBOARD_TIERS.has(tier);
}

export function resolveMembershipTier(
  membershipLabel: string,
  billingTier?: string | null,
): MembershipTier {
  const billingParsed = billingTier ? parseMembershipTier(billingTier) : 'basic';
  if (billingParsed !== 'basic') return billingParsed;
  return parseMembershipTier(membershipLabel);
}
