# 07 — Deployment & Operations

> **CONFIDENTIAL — Kura Finance LLC Data Room**

## Production topology

```
Git push (main)
  → GitHub Actions (.github/workflows/deploy_app.kura-finance.com.yml)
  → docker build (NEXT_PUBLIC_* build-args)
  → Google Container Registry
  → Cloud Run service `app` (port 8080, us-central1)
```

There is **no** maintained local `scripts/` deploy path. **CI is the system of record** for production releases.

## Artifacts in this repo

| Artifact | Purpose |
|----------|---------|
| `Dockerfile` | Next.js standalone image |
| `.github/workflows/deploy_app.kura-finance.com.yml` | Official build & deploy |
| `proxy.ts` | CSP / security headers at the edge of the app |

## Build-time configuration (critical)

`NEXT_PUBLIC_*` values are **compiled into the JS bundle**. Changing Cloud Run runtime env alone does **not** update client behaviour — rebuild and redeploy.

| Variable | Production expectation |
|----------|------------------------|
| `NEXT_PUBLIC_BACKEND_URL` | Required |
| `NEXT_PUBLIC_APP_URL` | Required |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Required |
| `NEXT_PUBLIC_REOWN_PROJECT_ID` | Required |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` / `NEXT_PUBLIC_BASE_RPC_URL` | Strongly recommended |
| `NEXT_PUBLIC_PIMLICO_API_KEY` | Required for Smart Wallet paths |
| `NEXT_PUBLIC_PAY_GAS_IN_USDC` | Optional |
| `NEXT_PUBLIC_LIFI_INTEGRATOR` | CI: `kura` |
| `NEXT_PUBLIC_LIFI_FEE` | CI: `0.25` |
| `NEXT_PUBLIC_LIFI_API_KEY` | Optional |
| `NEXT_PUBLIC_STRIPE_PRICE_*` | Optional (billing UI) |

Full placeholder list: [`.env.example`](../.env.example).

## CI secrets (GitHub)

| Secret | Purpose |
|--------|---------|
| `GCP_PROJECT_ID` | GCP project |
| `GCP_SERVICE_ACCOUNT_KEY` | Deploy auth |
| `NEXT_PUBLIC_*` mirrors | As listed above |

## Post-deploy acceptance checklist

- [ ] HTTPS (Cloud Run default)  
- [ ] Backend CORS allows `NEXT_PUBLIC_APP_URL`  
- [ ] WebAuthn / passkey origins aligned with API RP ID  
- [ ] Treasuries API live and membership-gated  
- [ ] Privy / Reown production domains allowlisted  
- [ ] Pimlico key present — smoke Smart Wallet send or Earn deposit  
- [ ] CSP allows API, `api.morpho.org`, Safe TX Service (Base)  
- [ ] Approvals: propose → co-sign → execute  

## Operational failure modes

| Symptom | Likely cause |
|---------|----------------|
| Login works locally, not prod | Wrong Privy App ID at build / origin allowlist |
| `/api/*` 404 | Wrong `NEXT_PUBLIC_BACKEND_URL` at build |
| Smart Wallet actions fail | Missing Pimlico build-arg |
| Morpho empty | Network / CSP to Morpho |
| Approvals stuck | Safe undeployed / EOA not owner / TX Service blocked |
| Stale env in prod | Runtime env changed without rebuild |

## Local verification (engineering under license)

```bash
npm install
cp .env.example .env.local   # fill licensed keys
npm run dev
npm run lint && npm run build
```

Standalone smoke: `npm run build && npm run start:standalone`.
