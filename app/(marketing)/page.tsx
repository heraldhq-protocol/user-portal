'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const PROTOCOLS = [
  'Jupiter',
  'Drift',
  'Marinade',
  'Marginfi',
  'Orca',
  'Kamino',
  'Solend',
  'Raydium',
];

const trustCards = [
  {
    icon: '🔒',
    title: 'Zero PII',
    desc: 'We never see your email address. Ever.',
  },
  {
    icon: '⛓',
    title: 'On-chain proof',
    desc: 'Every send is verifiably recorded on Solana.',
  },
  {
    icon: '📧',
    title: 'Any inbox',
    desc: 'Works with Gmail, Outlook, Proton — any email.',
  },
];

const howSteps = [
  {
    n: '01',
    title: 'Connect wallet',
    desc: 'Your wallet is your identity. No username needed.',
  },
  {
    n: '02',
    title: 'Enter email',
    desc: 'Encrypted in your browser. We receive only ciphertext.',
  },
  {
    n: '03',
    title: 'Done',
    desc: 'Receive DeFi alerts from any protocol, privately.',
  },
];

const demoNotifications = [
  {
    type: 'defi' as const,
    proto: 'Drift Protocol',
    msg: 'Health factor 1.05 — add collateral',
    time: 'Just now',
  },
  {
    type: 'governance' as const,
    proto: 'Realms DAO',
    msg: 'Proposal #47 vote closes in 23h',
    time: '2m ago',
  },
  {
    type: 'defi' as const,
    proto: 'Marginfi',
    msg: 'Position near liquidation threshold',
    time: '5m ago',
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  return (
    <div>
      {/* ───── Hero ───── */}
      <section className="px-8 pt-20 pb-16 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 rounded-full px-3.5 py-1.5 text-xs font-semibold text-teal mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                Privacy-preserving · On-chain verified
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-[-2px] mb-5"
            >
              Your wallet
              <br />
              <span className="text-teal">is your address.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-[17px] text-text-secondary leading-[1.7] mb-9 max-w-[420px]"
            >
              Receive DeFi alerts directly to your inbox — without sharing your email with any
              protocol. Herald never stores your email in plaintext.
            </motion.p>

            <motion.div variants={item} className="flex gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-teal text-navy font-bold text-[15px] px-7 py-3 rounded-[10px] hover:bg-teal-2 active:scale-[0.97] transition-all duration-150"
              >
                Register now →
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 bg-card text-text-secondary font-semibold text-[15px] px-7 py-3 rounded-[10px] border border-border-2 hover:border-teal/50 hover:text-text-primary transition-all duration-150"
              >
                How it works
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Demo notification card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="bg-card border border-border-2 rounded-2xl p-6">
              <div className="text-[11px] text-text-muted font-semibold uppercase tracking-widest mb-3.5">
                Live notification preview
              </div>
              {demoNotifications.map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  <div
                    className={`flex gap-3.5 items-start p-4 rounded-xl border border-border bg-card transition-colors hover:border-border-2 ${i < 2 ? 'mb-2.5' : ''}`}
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0 glow-dot"
                      style={{
                        background:
                          n.type === 'governance'
                            ? 'var(--color-herald-purple)'
                            : 'var(--color-teal)',
                        boxShadow: `0 0 0 3px ${n.type === 'governance' ? 'rgba(91,53,213,0.25)' : 'rgba(0,200,150,0.25)'}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span
                          className="text-xs font-bold"
                          style={{
                            color: n.type === 'governance' ? '#A78BFA' : 'var(--color-teal)',
                          }}
                        >
                          {n.proto}
                        </span>
                        <span className="text-[11px] text-text-muted">{n.time}</span>
                      </div>
                      <p className="text-[13px] text-text-secondary truncate">{n.msg}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="mt-3.5 px-3.5 py-2.5 bg-teal/5 rounded-lg border border-teal/12">
                <p className="text-[11px] text-teal font-semibold">
                  🔒 Received without sharing your email with any protocol
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── Trust Cards ───── */}
      <section className="px-8 pb-16 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustCards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="text-[28px] mb-3">{c.icon}</div>
              <div className="font-bold text-base mb-1.5">{c.title}</div>
              <div className="text-[13px] text-text-muted leading-relaxed">{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="px-8 pb-16 max-w-[1100px] mx-auto">
        <h2 className="text-[13px] font-bold tracking-[2px] text-text-muted uppercase mb-8">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howSteps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <div className="mb-3">
                <span className="font-mono text-[11px] text-teal font-medium">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
              {i < 2 && <div className="mt-5 w-full h-px bg-border hidden md:block" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───── Protocol Marquee ───── */}
      <section className="border-t border-border pt-10 pb-20">
        <div className="text-xs text-text-muted font-semibold tracking-[2px] uppercase text-center mb-6">
          Integrated protocols
        </div>
        <div className="overflow-hidden">
          <div className="flex gap-8 animate-marquee w-max">
            {[...PROTOCOLS, ...PROTOCOLS].map((p, i) => (
              <div
                key={i}
                className="px-6 py-2 bg-card border border-border rounded-lg text-[13px] font-semibold text-text-secondary whitespace-nowrap"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
