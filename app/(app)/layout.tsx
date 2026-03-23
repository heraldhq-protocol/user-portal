'use client';
// import { useWallet } from '@solana/wallet-adapter-react';
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // const { connected } = useWallet();
  return (
    <main id="main-content" className="flex-1 flex flex-col">
      {children}
    </main>
  );
}
