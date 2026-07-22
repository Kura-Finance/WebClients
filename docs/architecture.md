# 03 — Architecture

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router), React 19 |
| Auth UX | Privy |
| State | Zustand |
| On-chain (Base) | viem, permissionless / Pimlico, Safe |
| DeFi data | Morpho GraphQL |
| Multisig queue | Safe Transaction Service (Base) |
| Swaps / bridge | Li.Fi |
| TrackFi | Plaid Link + backend E2EE snapshots |
| Billing | Stripe (server-created sessions) |
| Deploy | Docker standalone → Google Cloud Run |

## Logical architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Browser — Kura Web Client                                   │
│  layout / providers → dashboard routes → domain components   │
│  Zustand stores · app/lib API clients · app/lib/crypto       │
│  proxy.ts (CSP + security headers)                           │
└───────────────┬────────────────────────────┬─────────────────┘
                │                            │
                ▼                            ▼
     Kura API (backendserver)      Public / SaaS endpoints
     auth · treasuries · plaid     Privy · Morpho · Safe TX
     stripe · passkeys · …         Pimlico · Li.Fi · Alchemy
```

## Route map (product surfaces)

| Area | Primary routes |
|------|----------------|
| Home / cash | `/dashboard` |
| Transfer / Add Money | `/dashboard/payment`, `/dashboard/add-money` |
| Treasury | `/dashboard/treasury` |
| Approvals | `/dashboard/approvals` |
| Earn | `/dashboard/earn`, `/dashboard/earn/[address]` |
| Borrow | `/dashboard/borrow`, `/dashboard/borrow/[marketId]` |
| Markets | `/dashboard/markets`, `/dashboard/markets/[symbol]` |
| TrackFi | Bank / Broker / settings accounts |
| Billing | Plan / billing routes |

## Backend domain alignment

Same API family as mobile. Representative modules:

| Backend domain | Client module | Purpose |
|----------------|---------------|---------|
| `auth` | `app/lib/authApi.ts` | Privy exchange, session, passkey |
| `treasuries` | `app/lib/treasuryApi.ts`, `treasurySync.ts` | Org Safe persistence |
| `plaid` | `app/lib/plaidApi.ts` | Link + encrypted snapshots |
| `exchange` | `useExchangeStore.ts` | CEX credentials (encrypted) |
| `debank` | `app/lib/debankApi.ts` | DeFi portfolio proxy |
| `asset` | `app/lib/assetApi.ts` | Aggregated history |
| `stripe` | `app/lib/stripeApi.ts` | Checkout / portal |

HTTP: cookie session (`credentials: 'include'`), envelope `{ success, data, error }` via `httpClient.ts`.  
Production: Next rewrites `/api/*` → backend (`next.config.ts`).

## On-chain execution paths

| Path | Mechanism | Code anchors |
|------|-----------|--------------|
| Smart Wallet UserOp | Pimlico bundler / paymaster | `app/lib/smartAccountSend.ts` |
| Treasury propose | Sign + Safe TX Service | `app/lib/proposeTreasuryCalls.ts`, `safeTxService.ts` |
| Morpho Earn | ERC-4626 (+ fee wrapper map) | `app/lib/morphoEarn.ts`, `morphoApi.ts` |
| Morpho Borrow | Morpho Blue | `app/lib/morphoBlue.ts` |
| Shared submit | Smart execute **or** Treasury propose | `app/lib/submitTradingCalls.ts` |

## Security-relevant client layers

| Concern | Location |
|---------|----------|
| Env centralization | `app/config/env.ts` |
| CSP / headers | `proxy.ts` |
| Passkey + finance vault | `app/lib/crypto/` |
| Session bootstrap | `PrivyAuthBridge`, `AppSessionHydrator` |

## Repository layout

```
app/                 App Router, components, lib, store, config
proxy.ts             CSP middleware
Dockerfile           Standalone Node server (port 8080)
.github/workflows/   Production deploy to Cloud Run
docs/                This Data Room
.env.example         Placeholder config only (no secrets)
```

There is **no** `scripts/` deploy helper; production shipping is **CI-only** (see [deployment-operations.md](deployment-operations.md)).
