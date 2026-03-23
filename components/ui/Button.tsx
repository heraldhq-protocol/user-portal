'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  /* base */
  'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:opacity-40 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-teal text-navy font-bold hover:bg-teal-2 active:scale-[0.97]',
        secondary:
          'bg-card text-text-secondary border border-border-2 hover:border-teal/50 hover:text-text-primary',
        ghost: 'text-text-muted hover:text-text-primary hover:bg-card bg-transparent',
        danger:
          'bg-herald-red/10 text-herald-red border border-herald-red/30 hover:bg-herald-red/20',
        outline: 'border border-teal/40 text-teal bg-transparent hover:bg-teal/10',
      },
      size: {
        xs: 'text-xs px-3 py-1.5 rounded-lg',
        sm: 'text-sm px-4 py-2',
        md: 'text-[15px] px-7 py-3',
        lg: 'text-base px-8 py-3.5',
        xl: 'text-lg px-10 py-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
