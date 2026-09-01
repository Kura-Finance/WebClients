# Product overview

The Kura Web Client is a **Next.js** finance dashboard that combines:

1. **On-chain treasury and DeFi** on Base (Smart Wallet, Treasury Safes, Morpho Earn/Borrow, Markets, Dinari stocks)
2. **TrackFi** aggregation (banks, brokerages, CEX, DeFi) via the Kura backend with passkey E2EE
3. **Membership billing** via Stripe
4. **Card** waitlists (metal / virtual) — waitlist only in this client

Hosted production: **`app.kura-finance.com`**. How to run and ship: [deploy.md](deploy.md).

## Capability matrix

| Capability | User surface | Execution model | Backend required? |
|------------|--------------|-----------------|-------------------|
| Login | Privy email / social | Session cookie after exchange | **Yes** |
| Passkey E2EE unlock | Settings / finance unlock | WebAuthn PRF → in-memory DEK | **Yes** |
| Personal Smart Wallet | Home, Transfer, Add Money | Privy EOA + Safe + **Pimlico** UserOps | Session; fiat/KYC via backend |
| Org Treasury | `/dashboard/treasury` | Counterfactual / deployed Safe; holdings | **Yes** (Treasuries API) |
| Approvals | `/dashboard/approvals` | Safe Transaction Service propose → sign → execute | No* (*owners on-chain) |
| Team | `/dashboard/team` | Add/remove Safe owners, change threshold | **Yes** (org + on-chain) |
| Report | `/dashboard/report` | Treasury / cashflow presentation | **Yes** (org + TrackFi/wallet activity) |
| Earn | `/dashboard/earn/[vault]` | Morpho vault deposit/withdraw | No* (*Pimlico if Smart Wallet) |
| Borrow | `/dashboard/borrow/[market]` | Morpho Blue borrow/repay | No* (*Pimlico if Smart Wallet) |
| Markets | `/dashboard/markets/[symbol]` | Li.Fi swap on Base; TradingView | No* (*Pimlico) |
| Tokenized stocks | `/dashboard/rwa`, `/dashboard/rwa/[symbol]` | Dinari dShares on Base | **Yes** (Dinari + KYC) |
| Card | `/dashboard/card` | Waitlist (metal / virtual) | **Yes** (waitlist API) |
| TrackFi banks | `/dashboard/accounts` | Plaid + encrypted snapshots | **Yes** |
| TrackFi brokers | `/dashboard/investment` | Encrypted snapshots | **Yes** |
| TrackFi DeFi | `/dashboard/defi-protocol` | DeBank proxy | **Yes** |
| CEX connections | `/dashboard/exchange` | Encrypted API keys on server | **Yes** |
| Portfolio | `/dashboard/crypto` | Aggregated holdings | Session + RPC / backend |
| Billing | Plan / billing | Stripe Checkout / portal | **Yes** |

\* Treasury Morpho / Markets actions from an org Safe **propose** into Approvals instead of immediate UserOps.

## Product boundaries

| Included in web client | Not included / separate |
|------------------------|-------------------------|
| UI, routing, client crypto helpers | Backend business logic and DB |
| Smart Wallet and Treasury UX | Mobile SCA / deep wallet features |
| Morpho / Li.Fi / Safe TX Service calls from the browser | Smart-contract audits of Morpho / Safe / Dinari |
| TrackFi presentation after decrypt | Plaid token custody (backend) |
| Stripe price ID display and redirect | Stripe secret keys (backend) |
| Card waitlist UI | Card issuing / processor |
| Dinari KYC and order UX | Dinari custody / broker backend |

## Dual account model

| Account | Salt / role | Typical use |
|---------|-------------|-------------|
| **Personal Smart Wallet** | Distinct Safe (personal) | Everyday Transfer, Earn, Borrow, Markets, stocks |
| **Treasury Safe(s)** | Org Safe(s), multi-owner | Company cash, Approvals, Team |

Personal Smart Wallet ≠ Treasury. Fiat KYC (including Dinari) attaches to the personal / ops path, not to Treasury cash itself.

## License and packaging

- Source and branding are **proprietary** ([LICENSE](../LICENSE)).
- White-label, source license, or acquisition: **security@kura-finance.com**.
- This repo alone cannot run full TrackFi, Treasuries persistence, billing, or Dinari without a **backendserver** deployment.
