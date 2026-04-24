# Kura Finance Web

Kura Finance is a privacy-focused finance dashboard built with Next.js App Router.
This repository contains the web frontend (`app.kura-finance.com`) for account linking, portfolio views, and zero-knowledge authentication flows.

## Features

- Zero-knowledge auth flow with SRP-based login and password operations
- Plaid integration for bank and brokerage account snapshots
- Reown (WalletConnect) integration for Web3 wallet connections
- Client-side encrypted local finance cache (AES-GCM with in-memory data key session)
- Unified API client with standard response envelope handling
- Shadcn-style UI component system on top of Tailwind CSS

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Zustand (state), React Query (server state), wagmi + viem (Web3)
- Framer Motion, Recharts, Tailwind CSS

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend API service (separate repository)

## Environment Variables

Create a `.env.local` file in this project root:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
```

Notes:

- `NEXT_PUBLIC_REOWN_PROJECT_ID` is required for WalletConnect/Reown QR connection flow.

## Local Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - run local dev server
- `npm run lint` - run ESLint
- `npm run build` - production build check
- `npm run start` - run production server locally
- `npm run build:standalone` - standalone build target
- `npm run cert:gen` - generate local certificate

## API Response Contract (Frontend Expectation)

The frontend expects backend APIs to follow:

- Success envelope:
  - `{ "success": true, "data": { ... }, "meta": { ... } }`
- Error envelope:
  - `{ "success": false, "error": { "code": "...", "message": "...", "details": ... } }`

The client also tolerates legacy/fallback error payloads such as:

- `{ "error": "Internal server error" }`
- `{ "error": "伺服器錯誤" }`

Health endpoints that intentionally return raw JSON (non-envelope) are also supported.

## Security Notes

- Never commit secrets, keys, or real `.env` files.
- Authentication tokens are cookie-based for web usage.
- Decrypted finance keys are kept in memory during session and cleared on logout.
- Use HTTPS in all non-local environments.

## Deployment

This repository includes CI/CD workflow and deployment scripts.
Common commands:

```bash
npm run build
npm run deploy
```

## Contributing

1. Create a feature branch
2. Keep changes focused and reviewable
3. Run `npm run lint` and `npm run build` before opening PR
4. Include clear test notes in PR description

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See the `LICENSE` file for the full text.
