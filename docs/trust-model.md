# 04 — Trust Model

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Principles

| Principle | Implication |
|-----------|-------------|
| **Clear boundaries** | Browser client vs Kura API vs third-party SaaS are separated in diligence. |
| **Honest residual trust** | DeFi / auth / banking vendors cannot be eliminated by client code alone. |
| **E2EE for TrackFi** | Bank/CEX plaintext is intended to exist in browser memory only after passkey unlock. |
| **Closed commercial product** | No public contribution model; redistribution requires a written license. |

## In this repository

| Component | Diligence note |
|-----------|----------------|
| Next.js UI & routing | Full product surface for web |
| Client crypto helpers | Passkey unlock + finance vault |
| API clients | Talk to Kura backend + public chain APIs |
| CSP policy | `proxy.ts` |
| Deploy workflow | GitHub Actions → GCR → Cloud Run |
| `.env.example` | Placeholders only |

## Outside this repository

| Component | Diligence note |
|-----------|----------------|
| **Kura API** | Session, Treasuries DB, Plaid tokens, Stripe secrets, ciphertext storage |
| **Privy** | Identity / embedded wallet infrastructure |
| **Plaid** | Bank linking (tokens server-side) |
| **Pimlico** | ERC-4337 bundler / paymaster |
| **Morpho / Safe / Li.Fi** | Protocol & infrastructure risk |
| **Production secrets** | Never stored in git |

## Client security behaviours (expected)

1. Privy login → backend exchange → HttpOnly session cookie  
2. TrackFi decrypt only after WebAuthn PRF unlock  
3. Plaid Link via hosted UI; no Plaid secrets in the browser bundle  
4. Explicit wallet / UserOp confirmation paths for on-chain actions  
5. Logout clears in-memory finance keys  
6. CSP restricts script and connect targets  

## Residual trust table

| Party | What you still trust |
|-------|----------------------|
| Privy | Auth integrity & availability |
| Pimlico | UserOp inclusion / paymaster behaviour |
| Alchemy (or RPC) | Honest chain reads |
| Morpho API | Market / vault metadata integrity |
| Safe Transaction Service | Queue availability & authenticity of stored txs |
| Li.Fi | Quote / route integrity |
| Kura backend | Ciphertext storage, Plaid orchestration, no malicious payloads |
| End-user browser | No malware / hostile extensions after unlock |

## Dual-repo dependency

Full TrackFi + Treasury persistence **requires** a licensed backend deployment. The web client alone can still exercise some on-chain flows (Morpho / Approvals) if RPC, Pimlico, and Privy are configured, but that is not the complete commercial product.
