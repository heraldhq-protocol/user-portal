import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy — Herald',
  description:
    'Learn how Herald protects your privacy with client-side encryption, on-chain storage, and zero PII exposure.',
};

export default function PrivacyPage() {
  const sections = [
    {
      title: 'Client-side encryption',
      content:
        "Your email is encrypted entirely in your browser using TweetNaCl.js (NaCl box encryption). The plaintext email never leaves your device — Herald's servers only ever see the encrypted ciphertext.",
    },
    {
      title: 'On-chain identity',
      content:
        'Your encrypted email, nonce, SHA-256 hash, and notification preferences are stored in a Solana Program Derived Address (PDA). Only your wallet can authorize changes to this data.',
    },
    {
      title: 'Decryption in a TEE',
      content:
        'When a protocol sends you a notification, Herald decrypts your email inside an AWS Nitro Enclave (Trusted Execution Environment). Memory is zeroed immediately after the email is routed — nothing is persisted.',
    },
    {
      title: 'What Herald never stores',
      items: [
        'Your plaintext email address',
        'Your wallet public key (we store SHA-256 hashes only)',
        'Any association between your email and wallet in our database',
      ],
    },
    {
      title: 'ZK receipts',
      content:
        'Every email delivery produces a ZK-compressed receipt on Solana via Light Protocol. This gives you verifiable, immutable proof that notifications were delivered — without exposing your identity.',
    },
    {
      title: 'GDPR compliance',
      content:
        'You can delete your on-chain identity at any time from the Preferences page. This permanently closes your IdentityAccount PDA and returns the rent to your wallet. All future notifications will be silently dropped.',
    },
  ];

  return (
    <div className="max-w-[700px] mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy at Herald</h1>
        <p className="text-base text-text-muted leading-[1.7] max-w-[540px]">
          Herald was designed from the ground up to ensure your email address is never exposed to
          Herald&rsquo;s servers, notification protocols, or any third party.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-3">{s.title}</h2>
            {s.content && <p className="text-sm text-text-muted leading-[1.7]">{s.content}</p>}
            {s.items && (
              <ul className="space-y-2 mt-1">
                {s.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-text-muted leading-[1.6]"
                  >
                    <span className="text-herald-red mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
