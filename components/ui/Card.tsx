import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use elevated=true for nested/card-2 styling */
  elevated?: boolean;
}

export function Card({ className, elevated = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        elevated
          ? 'bg-card-2 border border-border-2 rounded-xl p-5'
          : 'bg-card border border-border',
        className,
      )}
      {...props}
    />
  );
}
