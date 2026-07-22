# Security & Vulnerability Disclosure

> **CONFIDENTIAL — Kura Finance LLC Data Room**  
> Applies to licensed customers, diligence counterparties, and authorized security researchers under NDA.

## Scope

In scope for coordinated disclosure:

- The **Kura Web Client** as deployed at `app.kura-finance.com` (or a buyer’s licensed deployment of this codebase)
- Client-side handling of sessions, passkey unlock, CSP, and wallet connect UX

Out of scope unless separately contracted:

- Kura hosted backend internals (separate product)
- Third-party platforms (Privy, Plaid, Morpho, Safe, Pimlico, Li.Fi, Stripe, etc.)
- Social engineering / physical attacks
- Denial-of-service against public infrastructure

## How to report

Email **security@kura-finance.com** with:

1. Affected URL / build / version if known  
2. Step-by-step reproduction  
3. Impact assessment (confidentiality / integrity / availability)  
4. Optional: suggested fix  

Do **not** open public GitHub issues for security findings. Do **not** publish exploit details before coordinated remediation.

## Response expectations

| Stage | Target |
|-------|--------|
| Acknowledgement | Within 3 business days |
| Initial triage | Within 10 business days |
| Remediation / status update | Risk-dependent; critical issues prioritized |

Kura Finance LLC may request an NDA before sharing remediation detail or source context.

## Safe harbor (good-faith research)

Good-faith testing that:

- Avoids privacy violations, data destruction, and service disruption  
- Stops at proof of concept without lateral movement  
- Reports privately as above  

…will not be pursued as a legal matter by Kura Finance LLC, to the extent permitted by law. This is not a bug bounty program unless separately contracted.

## Commercial security review

For formal penetration tests, SOC questionnaires, or source-assisted audits under a commercial agreement, contact **security@kura-finance.com**.
