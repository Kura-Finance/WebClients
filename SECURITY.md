# Security & vulnerability disclosure

Report vulnerabilities in the Kura Web Client privately. Do not file public GitHub issues for security findings and do not publish exploit details before coordinated remediation.

## Scope

In scope:

- The **Kura Web Client** as deployed at `app.kura-finance.com`, or another deployment of this codebase
- Client-side handling of sessions, passkey unlock, CSP, and wallet-connect UX

Out of scope unless separately arranged:

- Kura hosted backend internals (separate product)
- Third-party platforms (Privy, Plaid, Morpho, Safe, Pimlico, Li.Fi, Stripe, Dinari, TradingView, etc.)
- Social engineering / physical attacks
- Denial-of-service against public infrastructure

## How to report

Email **security@kura-finance.com** with:

1. Affected URL / build / version if known
2. Step-by-step reproduction
3. Impact (confidentiality / integrity / availability)
4. Optional: suggested fix

## Response targets

| Stage | Target |
|-------|--------|
| Acknowledgement | Within 3 business days |
| Initial triage | Within 10 business days |
| Remediation / status update | Risk-dependent; critical issues first |

## Safe harbor (good-faith research)

Good-faith testing that:

- Avoids privacy violations, data destruction, and service disruption
- Stops at proof of concept without lateral movement
- Reports privately as above

…will not be pursued as a legal matter by Kura Finance LLC, to the extent permitted by law. This is not a bug bounty unless separately contracted.

## Audits and questionnaires

Penetration tests, SOC questionnaires, or source-assisted reviews: **security@kura-finance.com**.
