'use client';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import {
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

export function WalletConnection({ children }: Readonly<{ children: React.ReactNode }>) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [],
  );
  const DEVNET_URL = 'https://api.devnet.solana.com';
  return (
    <ConnectionProvider endpoint={DEVNET_URL}>
      <WalletProvider wallets={wallets}>{children}</WalletProvider>
    </ConnectionProvider>
  );
}
