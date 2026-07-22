# Kura Web Client — Commercial Data Room

> **CONFIDENTIAL — Kura Finance LLC**  
> For authorized commercial diligence, licensing, and acquisition review only.  
> Not an open-source project. Unauthorized redistribution is prohibited.

| | |
|---|---|
| **Product** | Kura Web Dashboard (`app.kura-finance.com`) |
| **Artifact** | Proprietary Next.js application (this repository) |
| **License** | [LICENSE](LICENSE) — All Rights Reserved |
| **Commercial contact** | **security@kura-finance.com** |

---

## What buyers are reviewing

The **Kura Web Client** is the browser application for:

- Personal **Smart Wallet** on Base (Transfer, Add Money)
- Organization **Treasury** Safes (multi-owner cash + holdings)
- **Approvals** (propose → sign → execute Safe transactions)
- **Earn / Borrow** (Morpho on Base)
- **Markets** (spot crypto / Li.Fi)
- **TrackFi** (Plaid banks & brokerages, CEX, DeBank — via Kura backend + passkey E2EE)
- **Billing** (Stripe subscription UI)

The hosted **API** and **mobile wallet** are separate proprietary products. This Data Room covers the **web client** only, with explicit dependencies on backend and third parties.

---

## Data Room index

| # | Document | Diligence use |
|---|----------|----------------|
| 01 | [docs/README.md](docs/README.md) | Index & document control |
| 02 | [docs/product-overview.md](docs/product-overview.md) | Capability matrix & product boundaries |
| 03 | [docs/architecture.md](docs/architecture.md) | System design & module map |
| 04 | [docs/trust-model.md](docs/trust-model.md) | Trust boundaries & residual third parties |
| 05 | [docs/threat-model.md](docs/threat-model.md) | Assets, adversaries, mitigations, non-goals |
| 06 | [docs/third-party-dependencies.md](docs/third-party-dependencies.md) | Vendor matrix & data flows |
| 07 | [docs/deployment-operations.md](docs/deployment-operations.md) | Production build, CI/CD, Cloud Run |
| 08 | [docs/environment-secrets.md](docs/environment-secrets.md) | Config surface & key hygiene |
| 09 | [SECURITY.md](SECURITY.md) | Vulnerability disclosure (licensed parties) |
| — | [LICENSE](LICENSE) | IP & licensing terms |

---

## Related proprietary systems (out of this repo)

| System | Role |
|--------|------|
| **backendserver** | API (`api.kura-finance.com`) — auth, Treasuries, TrackFi, Stripe, passkeys |
| **mobile-app** | React Native wallet (iOS / Android) |

---

## Engagement

White-label, source license, acquisition, or technical diligence scheduling:

**security@kura-finance.com**
