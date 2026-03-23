'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1 border',
  {
    variants: {
      variant: {
        defi: 'bg-herald-red/10 text-red-400 border-herald-red/25',
        governance: 'bg-herald-purple/15 text-purple-400 border-herald-purple/30',
        system: 'bg-herald-gold/12 text-amber-300 border-herald-gold/25',
        marketing: 'bg-text-muted/15 text-text-muted border-text-muted/20',
        success: 'bg-herald-green/10 text-herald-green border-herald-green/25',
        error: 'bg-herald-red/10 text-herald-red border-herald-red/25',
        warning: 'bg-herald-gold/10 text-herald-gold border-herald-gold/25',
        info: 'bg-teal/10 text-teal border-teal/25',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
