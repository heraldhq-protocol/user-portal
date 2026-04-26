# Herald User Portal

The privacy-first notification management portal for **Herald Protocol** on Solana. Users register their encrypted email, manage notification preferences, connect Telegram, and control their end-to-end encryption keys — all without revealing personal information on-chain.

> **Live**: [notify.useherald.xyz](https://notify.useherald.xyz)
> **Stack**: Next.js 16 · React 19 · Solana Wallet Adapter · @herald-protocol/sdk

---

## Features

- **Wallet-First Authentication** — Connect with Phantom, Solflare, Coinbase, or Ledger. Session persists across navigations with `autoConnect`.
- **On-Chain Registration** — Encrypt your email client-side (NaCl), hash it (SHA-256), and store both on Solana via the Herald Privacy Registry program.
- **Notification Preferences** — Toggle DeFi, governance, and marketing alert categories. Switch between real-time and daily digest delivery.
- **End-to-End Encryption Keys** — Generate, rotate, and revoke X25519 notification keys. Keys are sealed for the Herald Enclave and stored on-chain.
- **Multi-Channel Support** — Connect Telegram for high-priority alerts (SMS coming soon). All contact info is encrypted before on-chain storage.
- **Mobile Responsive** — Fully responsive design optimized for Phantom's in-app browser and mobile wallets.

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
NEXT_PUBLIC_RPC_CLUSTER="devnet"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_HERALD_PROGRAM_ID=2pxjAf8tLCakKVDuN4vY51B5TeaEQk4koPuk9NZvWqdf
NEXT_PUBLIC_ENCLAVE_MODE=sandbox
NEXT_PUBLIC_ENCLAVE_TEST_KEY="<base64 symmetric key for sandbox>"
```

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
```

---

## Project Structure

```
app/
├── (app)/
│   ├── register/           # Registration wizard (4-step flow)
│   ├── notifications/      # Notification history + E2E decryption
│   └── preferences/        # Preferences, channels, notification keys
│       └── telegram/       # Telegram connect flow
components/
├── registration/           # StepConnectWallet, StepEnterEmail, StepEncryptSign, StepSuccess
├── preferences/            # PreferencesForm, ChannelStatusCard, NotificationKeyCard
├── notifications/          # NotificationList, NotificationCard
└── ui/                     # Button, Card, Loader, Modal (design system)
hooks/
├── useRegistration.ts      # Full registration flow state machine
├── useNotificationKey.ts   # Key register/rotate/revoke
├── useDecryptNotifications.ts  # Batch E2E decryption
└── useWalletRegistrationStatus.ts  # On-chain identity lookup
lib/
├── crypto.ts               # Sandbox/production encryption helpers
├── api.ts                  # JWT-authenticated API client
└── utils.ts                # Address truncation, classnames
```

---

## Architecture

### Registration Flow

1. **Connect Wallet** → auto-detect if already registered
2. **Enter Email** → validated client-side
3. **Encrypt & Sign** → NaCl encrypt email, hash it, derive X25519 key, build 2 instructions (identity + notification key), sign transaction
4. **Success** → 30s countdown with Share on X / View on Solscan before redirect

### Encryption Model

| Environment | Email Encryption | Notification Key Sealing |
|---|---|---|
| **Sandbox/Devnet** | `nacl.secretbox` (symmetric, test key) | Deterministic fallback X25519 keypair |
| **Production** | AWS KMS via SDK | Real Herald Enclave wrapping pubkey |

---

## License

MIT
