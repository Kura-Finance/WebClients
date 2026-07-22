# 02 — Product Overview

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Summary

The Kura Web Client is a **Next.js** finance dashboard that combines:

1. **On-chain treasury & DeFi** on Base (Smart Wallet, Treasury Safes, Morpho Earn/Borrow, Markets)  
2. **TrackFi** aggregation (banks, brokerages, CEX) via the Kura backend with passkey E2EE  
3. **Membership billing** via Stripe  

Production hostname: **`app.kura-finance.com`**.

## Capability matrix

| Capability | User surface | Execution model | Backend required? |
|------------|--------------|-----------------|-------------------|
| Login | Privy email / social | Session cookie after exchange | **Yes** |
| Passkey E2EE unlock | Settings / finance unlock | WebAuthn PRF → in-memory DEK | **Yes** |
| Personal Smart Wallet | Home, Transfer, Add Money | Privy EOA + Safe + **Pimlico** UserOps | Session; fiat/KYC via backend |
| Org Treasury | `/dashboard/treasury` | Counterfactual / deployed Safe; holdings | **Yes** (Treasuries API) |
| Approvals | `/dashboard/approvals` | Safe Transaction Service propose → sign → execute | No* (*owners on-chain) |
| Earn | `/dashboard/earn/[vault]` | Morpho vault deposit/withdraw | No* (*Pimlico if Smart Wallet) |
| Borrow | `/dashboard/borrow/[market]` | Morpho Blue borrow/repay | No* (*Pimlico if Smart Wallet) |
| Markets | `/dashboard/markets/[symbol]` | Li.Fi swap on Base | No* (*Pimlico) |
| TrackFi banks / brokers | Bank, Broker, Accounts | Plaid + encrypted snapshots | **Yes** |
| CEX connections | Exchange | Encrypted API keys on server | **Yes** |
| Billing | Plan / billing | Stripe Checkout / portal | **Yes** |

\* Treasury Morpho / Markets actions from an org Safe **propose** into Approvals instead of immediate UserOps.

## Explicit product boundaries

| Included in web client | Not included / separate |
|------------------------|-------------------------|
| UI, routing, client crypto helpers | Backend business logic & DB |
| Smart Wallet & Treasury UX | Mobile SCA / deep wallet features |
| Morpho / Li.Fi / Safe TX Service calls from browser | Smart-contract audits of Morpho / Safe |
| TrackFi presentation after decrypt | Plaid token custody (backend) |
| Stripe price ID display & redirect | Stripe secret keys (backend) |

## Dual account model (important for diligence)

| Account | Salt / role | Typical use |
|---------|-------------|-------------|
| **Personal Smart Wallet** | Distinct Safe (personal) | Everyday Transfer, Earn, Borrow |
| **Treasury Safe(s)** | Org Safe(s), multi-owner | Company cash, Approvals workflow |

Personal Smart Wallet ≠ Treasury. Fiat ops KYC flows attach to the personal / ops path, not to Treasury cash itself.

## Commercial packaging notes

- Source and branding are **proprietary** ([LICENSE](../LICENSE)).  
- White-label / source license / acquisition: **security@kura-finance.com**.  
- This repo alone is insufficient to run full TrackFi without a licensed **backendserver** deployment.
