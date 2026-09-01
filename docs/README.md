# Documentation

Operator and architecture notes for the **Kura Web Client**. Start with local run and production deploy, then the product and trust surfaces.

This software is proprietary ([LICENSE](../LICENSE)). These docs are the public runbook — not a contributor guide and not an invitation to redistribute.

## Start here

| Doc | Use |
|-----|-----|
| [../README.md](../README.md) | Product summary and local quick start |
| [deploy.md](deploy.md) | Local, Docker, Cloud Run, env, secrets, checklist |

## Product and design

| Doc | Use |
|-----|-----|
| [product-overview.md](product-overview.md) | Capability matrix and product boundaries |
| [architecture.md](architecture.md) | Stack, routes, modules, execution paths |
| [third-party-dependencies.md](third-party-dependencies.md) | Vendors and data flows |
| [trust-model.md](trust-model.md) | Trust boundaries |
| [threat-model.md](threat-model.md) | Assets, adversaries, mitigations |

## Policy

| Doc | Use |
|-----|-----|
| [../SECURITY.md](../SECURITY.md) | Vulnerability disclosure |
| [../LICENSE](../LICENSE) | IP terms |

Production secrets, GCP keys, and customer data are never stored in this repository.

## Related systems (separate repos)

| Product | Role |
|---------|------|
| Kura API (`backendserver`) | Auth, Treasuries, TrackFi, Stripe, passkeys, Dinari |
| Kura Mobile | React Native wallet |

Contact: **security@kura-finance.com**
