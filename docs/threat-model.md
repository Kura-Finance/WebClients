# 05 — Threat Model

> **CONFIDENTIAL — Kura Finance LLC Data Room**

**Scope:** Kura Web Client in modern browsers.  
**Out of scope:** Backend internals, vendor infra, L1/L2 consensus, Morpho/Safe contract bugs (unless separately audited).

## Assets

| Asset | Where | Sensitivity |
|-------|-------|-------------|
| Passkey material | OS authenticator + backend registration | Critical |
| TrackFi DEK (unlocked) | Browser memory | Critical |
| Encrypted finance snapshots | Backend | Medium–High |
| Session cookie | HttpOnly cookie | High |
| CEX API keys (encrypted at rest) | Backend; plaintext after unlock | Critical |
| Smart Wallet / Treasury control | Privy EOA + Safe owners | Critical |
| Publishable `NEXT_PUBLIC_*` keys | JS bundle | Medium (by design) |

## Adversaries

| Adversary | Example goal |
|-----------|--------------|
| XSS on app origin | Steal DEK / session after unlock |
| Malicious extension | Exfiltrate decrypted TrackFi or prompt phishing UserOps |
| Network MITM | Cookie theft (mitigated by HTTPS + HttpOnly) |
| Compromised SDK | Alter Privy / Reown / Plaid flows |
| Compromised backend | Malicious ciphertext or Plaid abuse |
| Phishing | Fake login / fake Approvals UX |
| Unauthorized fork of client | Tampered bundle for key theft |

## Client mitigations

| Threat | Mitigation |
|--------|------------|
| JS session theft | HttpOnly cookie; no token in `localStorage` for Kura session |
| Silent finance read | E2EE until passkey unlock |
| Post-logout residue | Clear in-memory vault / stores |
| XSS blast radius | CSP in `proxy.ts` |
| Misconfigured auth | Feature gates on env (`app/config/env.ts`) |
| Accidental secret commit | `.gitignore`; rotation playbook |

## Residual risks (accepted for this architecture)

- Hostile browser extensions after unlock  
- Supply-chain compromise of npm / Privy / Pimlico  
- User approving malicious Safe txs in Approvals  
- Protocol risk on Morpho / Base / Li.Fi routes  
- Backend compromise (TrackFi ciphertext + Plaid tokens)

## Goals vs non-goals

| Goal | Non-goal |
|------|----------|
| Strong client-side E2EE for TrackFi after unlock | Zero-knowledge Plaid aggregation |
| Hardened CSP + cookie session | Replacing Privy |
| Clear Smart Wallet vs Treasury separation | Making web a full mobile SCA substitute |
| Honest third-party inventory | Claiming “non-custodial banking” for Plaid |

## High-level data flows

```
Login:     Privy → Kura exchange → HttpOnly cookie
TrackFi:   Passkey unlock → DEK → decrypt snapshots → UI
Treasury:  Backend hydrate Safes → holdings via RPC / Morpho
Approvals: Sign Safe tx → Safe TX Service → execute on Base
Earn/Borrow (personal): Pimlico UserOps
Earn/Borrow (treasury): propose → Approvals
```
