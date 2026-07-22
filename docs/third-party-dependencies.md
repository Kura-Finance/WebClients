# 06 — Third-Party Dependencies

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Connection classes

| Class | Examples | Config |
|-------|----------|--------|
| **Kura API** | Auth, Treasuries, Plaid, Stripe, passkeys | `NEXT_PUBLIC_BACKEND_URL` |
| **Keyed SaaS** | Privy, Reown, Pimlico, Alchemy, Li.Fi | `NEXT_PUBLIC_*` at **build** time |
| **Public protocol APIs** | Morpho GraphQL, Safe TX Service | CSP allowlist — no client secret |
| **Browser UX** | Plaid Link iframe, Privy modal | Hosted by vendor |

## Vendor matrix

| Vendor | Role | Client secret? | Failure impact |
|--------|------|----------------|----------------|
| **Privy** | Login + embedded EOA | App ID (public) | Login / signing blocked |
| **Reown** | External wallet AppKit | Project ID (public) | External portfolio connect |
| **Pimlico** | ERC-4337 bundler / paymaster | API key | Smart Wallet UserOps fail |
| **Alchemy** (or RPC) | Base JSON-RPC | API key / URL | Reads / some writes degrade |
| **Li.Fi** | Swap / bridge quotes | Integrator + fee + optional key | Cross-chain / swap UX |
| **Morpho** | Vault & market metadata | None | Earn / Borrow lists empty |
| **Safe** | TX Service (Base) | None | Approvals queue unavailable |
| **Plaid** | Bank link | **Backend only** | TrackFi banks |
| **Stripe** | Subscriptions | Price IDs in web; secrets on API | Billing UI |
| **CoinGecko / logo.dev** | Prices / icons | Optional | Cosmetic / pricing display |

## Li.Fi fee (commercial note)

`NEXT_PUBLIC_LIFI_FEE` is Li.Fi’s integrator fee as a **fraction of 1**.  
Production CI sets **`0.25` (25%)**. Local/staging should match unless intentionally testing a lower share. See `.env.example` and [deployment-operations.md](deployment-operations.md).

## Feature → dependency map

| Feature | Must have |
|---------|-----------|
| Login | Privy + Kura API |
| TrackFi | Kura API + Plaid (backend) + passkey |
| Treasuries persistence | Kura API (`/api/treasuries`) |
| Approvals | Privy EOA owner + Safe TX Service + Base |
| Smart Wallet Transfer / Earn / Borrow / Markets | Pimlico + Base RPC (+ Li.Fi for swap/bridge) |
| Earn / Borrow catalogs | Morpho GraphQL |

## Data residency / processing (high level)

| Data | Processed by |
|------|----------------|
| Email / social identity | Privy |
| Session | Kura API |
| Bank credentials | Plaid (Link); tokens on Kura API |
| TrackFi plaintext | Browser after unlock only (design intent) |
| On-chain balances / txs | Public Base network + indexers |
| Card / billing PII | Stripe + Kura API (as configured) |

Legal counsel should map this to the buyer’s DPA / subprocessors schedule under any license or acquisition.
