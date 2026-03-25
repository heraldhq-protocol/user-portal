"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	/* base */
	"inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 focus-visible:ring-offset-2 focus-visible:ring-offset-navy disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none shadow-sm",
	{
		variants: {
			variant: {
				primary:
					"bg-teal text-navy font-bold hover:bg-teal-2 hover:shadow-[0_0_20px_rgba(0,200,150,0.4)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
				secondary:
					"bg-white dark:bg-card text-slate-700 dark:text-text-secondary border border-slate-300 dark:border-border-2 hover:border-teal/50 hover:bg-slate-50 dark:bg-card-2 hover:text-white hover:shadow-lg active:scale-[0.98]",
				ghost:
					"text-slate-500 dark:text-text-muted hover:text-white hover:bg-white dark:bg-card bg-transparent shadow-none",
				danger:
					"bg-herald-red/10 text-herald-red border border-herald-red/30 hover:bg-herald-red/20 hover:border-herald-red/50 hover:shadow-[0_0_15px_rgba(214,48,49,0.2)] active:scale-[0.98]",
				outline:
					"border border-teal/40 text-teal bg-transparent hover:bg-teal/10 hover:border-teal/60 hover:shadow-[0_0_15px_rgba(0,200,150,0.15)] active:scale-[0.98]",
			},
			size: {
				xs: "text-xs px-3 py-1.5 rounded-lg",
				sm: "text-sm px-4 py-2",
				md: "text-[15px] px-6 py-2.5",
				lg: "text-[16px] px-8 py-3.5",
				xl: "text-[18px] px-10 py-4",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	}
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
	)
);
Button.displayName = "Button";

export { Button, buttonVariants };
