# 08 — Environment & Secrets

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Policy

| Rule | Detail |
|------|--------|
| Never commit secrets | `.env.local`, GCP keys, Pimlico/Alchemy/Li.Fi keys |
| Publishable ≠ harmless | `NEXT_PUBLIC_*` are visible to every browser user of that build |
| Rebuild after rotation | Bundle embeds public env at `next build` |
| Backend secrets stay backend | Plaid, Stripe secret, DB, JWT signing |

## Configuration surface

All client reads should go through `app/config/env.ts`. Template: [`.env.example`](../.env.example).

### Minimum to boot UI login

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Kura API |
| `NEXT_PUBLIC_APP_URL` | Web origin |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Login |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | External wallet AppKit |

### Required for commercial on-chain product

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_PIMLICO_API_KEY` | Smart Wallet UserOps |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` or `NEXT_PUBLIC_BASE_RPC_URL` | Base RPC |
| `NEXT_PUBLIC_LIFI_*` | Markets / bridge fee share (prod fee `0.25`) |

### Backend-coupled features

Treasuries persistence, TrackFi, Stripe checkout, passkey registration require a correctly configured **backendserver** (separate diligence pack).

## Rotation checklist

If a key may have leaked (chat, CI log, artifact):

1. Rotate at the vendor console (Privy, Pimlico, Alchemy, Li.Fi, Reown, GCP, Stripe prices if recreated).  
2. Rotate backend secrets via backend ops.  
3. Update GitHub Actions secrets.  
4. Rebuild and redeploy the web image.  
5. Retire old Cloud Run revisions that embedded the old public keys.  
6. Confirm Privy / Reown domain allowlists.  

## What is safe in git

| Path | Allowed |
|------|---------|
| `.env.example` | Yes — placeholders / comments only |
| `docs/` | Yes — no live secrets |
| `.env.local` | **No** |
| Service account JSON | **No** |

## Diligence note

Buyers should assume any historical `NEXT_PUBLIC_*` value that shipped in a public web build is **world-readable**, and plan rotation accordingly after license or acquisition cutover.
