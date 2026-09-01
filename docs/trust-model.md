# Trust model

## Principles

| Principle | Implication |
|-----------|-------------|
| **Clear boundaries** | Browser client vs Kura API vs third-party SaaS are separate. |
| **Honest residual trust** | DeFi / auth / banking vendors cannot be eliminated by client code alone. |
| **E2EE for TrackFi** | Bank/CEX plaintext is intended to exist in browser memory only after passkey unlock. |
| **MIT source** | This client is MIT-licensed ([LICENSE](../LICENSE)); hosted API and vendor keys remain outside the repo. |

## In this repository

| Component | Note |
|-----------|------|
| Next.js UI and routing | Full product surface for web |
| Client crypto helpers | Passkey unlock + finance vault |
| API clients | Kura backend + public chain APIs |
| CSP policy | `proxy.ts` |
| Deploy workflow | GitHub Actions → GCR → Cloud Run (official repo only) |
| `.env.example` | Placeholders only |

## Outside this repository

| Component | Note |
|-----------|------|
| **Kura API** | Session, Treasuries DB, Plaid tokens, Stripe secrets, Dinari, ciphertext storage |
| **Privy** | Identity / embedded wallet infrastructure |
| **Plaid** | Bank linking (tokens server-side) |
| **Pimlico** | ERC-4337 bundler / paymaster |
| **Dinari** | Tokenized stock broker / KYC |
| **Morpho / Safe / Li.Fi** | Protocol and infrastructure risk |
| **TradingView** | Chart content integrity |
| **Production secrets** | Never stored in git |

## Client security behaviours

1. Privy login → backend exchange → HttpOnly session cookie
2. TrackFi decrypt only after WebAuthn PRF unlock
3. Plaid Link via hosted UI; no Plaid secrets in the browser bundle
4. Explicit wallet / UserOp confirmation paths for on-chain actions
5. Logout clears in-memory finance keys
6. CSP restricts script and connect targets (including TradingView)

## Residual trust

| Party | What you still trust |
|-------|----------------------|
| Privy | Auth integrity and availability |
| Pimlico | UserOp inclusion / paymaster behaviour |
| Alchemy (or RPC) | Honest chain reads |
| Morpho API | Market / vault metadata integrity |
| Safe Transaction Service | Queue availability and authenticity of stored txs |
| Li.Fi | Quote / route integrity |
| Dinari | KYC, quotes, and settlement |
| TradingView | Chart feeds |
| Kura backend | Ciphertext storage, Plaid orchestration, no malicious payloads |
| End-user browser | No malware / hostile extensions after unlock |

## Dual-repo dependency

Full TrackFi, Treasury persistence, billing, passkeys, and Dinari **require** a backend deployment. The web client alone can still exercise some on-chain flows (Morpho / Approvals) if RPC, Pimlico, and Privy are configured — that is not the complete product.
