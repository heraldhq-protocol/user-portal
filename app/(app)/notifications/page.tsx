'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'defi' as const,
    protocol: 'Drift Protocol',
    time: '2m ago',
    subject: 'Liquidation Warning — Action Required',
    body: 'Health factor 1.05. Add collateral now.',
    tx: '5xR4mK...',
  },
  {
    id: 2,
    type: 'gov' as const,
    protocol: 'Realms',
    time: '3h ago',
    subject: 'Governance Proposal #47 — Vote closes 24h',
    body: 'SPL token emission rate change proposal is live.',
    tx: '3zK9nP...',
  },
  {
    id: 3,
    type: 'defi' as const,
    protocol: 'Marginfi',
    time: '5h ago',
    subject: 'Health Factor Alert — 1.18',
    body: 'Your position is approaching the warning threshold.',
    tx: '8mQ2vT...',
  },
  {
    id: 4,
    type: 'sys' as const,
    protocol: 'Herald',
    time: '1d ago',
    subject: 'Security Update — Action Required',
    body: 'Please review your connected wallets.',
    tx: '2nX5kL...',
  },
];

type FilterType = 'all' | 'defi' | 'gov' | 'sys';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'defi', label: 'DeFi' },
  { value: 'gov', label: 'Gov' },
  { value: 'sys', label: 'System' },
];

const TAG_STYLES: Record<string, string> = {
  defi: 'bg-herald-red/10 text-red-400 border-herald-red/25',
  gov: 'bg-herald-purple/15 text-purple-400 border-herald-purple/30',
  sys: 'bg-herald-gold/12 text-amber-300 border-herald-gold/25',
  mkt: 'bg-text-muted/15 text-text-muted border-text-muted/20',
};

const TAG_LABELS: Record<string, string> = {
  defi: 'DeFi',
  gov: 'Gov',
  sys: 'System',
  mkt: 'Marketing',
};

const DOT_COLORS: Record<string, string> = {
  defi: 'var(--color-teal)',
  gov: 'var(--color-herald-purple)',
  sys: 'var(--color-herald-gold)',
  mkt: 'var(--color-text-muted)',
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const filtered =
    filter === 'all' ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.type === filter);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header + filters */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[28px] font-extrabold tracking-tight">Notification history</h1>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 border',
                  filter === f.value
                    ? 'bg-teal text-navy border-teal'
                    : 'bg-transparent text-text-muted border-border-2 hover:border-teal/50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification list */}
        <AnimatePresence mode="popLayout">
          {filtered.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex gap-3.5 items-start p-4 rounded-xl border border-border bg-card mb-2.5 transition-colors hover:border-border-2"
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{ background: DOT_COLORS[n.type] }}
              />

              <div className="flex-1 min-w-0">
                {/* Badge + protocol + time */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-0.5 border',
                      TAG_STYLES[n.type],
                    )}
                  >
                    {TAG_LABELS[n.type]}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">{n.protocol}</span>
                  <span className="text-[11px] text-text-muted ml-auto">{n.time}</span>
                </div>

                {/* Subject + body */}
                <div className="text-sm font-semibold text-text-primary mb-0.5">{n.subject}</div>
                <div className="text-[13px] text-text-muted mb-2">{n.body}</div>

                {/* Receipt link */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-teal-dim">{n.tx}</span>
                  <a
                    href={`https://solscan.io/tx/${n.tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-teal font-semibold hover:text-teal-2 transition-colors"
                  >
                    View on Solscan ↗
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[32px] mb-3">📭</div>
            <p className="text-text-muted text-sm">No notifications in this category yet.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
