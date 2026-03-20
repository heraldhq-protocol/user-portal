import type { Metadata } from 'next';
import { Syne, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { WalletConnection } from '@/components/WalletConnection';
const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Herald — Privacy-Preserving Notifications for Solana',
    template: '%s | Herald',
  },
  description:
    'Receive DeFi alerts directly to your inbox — without sharing your email with any protocol. Herald encrypts your email in your browser and stores it on-chain.',
  keywords: ['Solana', 'DeFi', 'notifications', 'privacy', 'wallet', 'email', 'encryption'],
  openGraph: {
    title: 'Herald — Privacy-Preserving Notifications for Solana',
    description:
      'Receive DeFi alerts without sharing your email. Encrypted in your browser, stored on-chain.',
    url: 'https://notify.herald.xyz',
    siteName: 'Herald',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herald — Privacy-Preserving Notifications for Solana',
    description:
      'Receive DeFi alerts without sharing your email. Encrypted in your browser, stored on-chain.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-navy text-text-primary">
        {/* Skip to main content — accessibility requirement */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-teal focus:text-navy focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>

        <WalletConnection>{children}</WalletConnection>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0D1F35',
              border: '1px solid #0E2A3D',
              color: '#FFFFFF',
              fontFamily: 'var(--font-syne)',
            },
          }}
        />
      </body>
    </html>
  );
}
