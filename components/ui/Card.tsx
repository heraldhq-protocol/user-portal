import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Use elevated=true for nested/card-2 styling */
	elevated?: boolean;
}

export function Card({ className, elevated = false, ...props }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl p-6",
				elevated
					? "bg-slate-50 dark:bg-card-2 border border-slate-300 dark:border-border-2 rounded-xl p-5"
					: "bg-white dark:bg-card border border-slate-200 dark:border-border",
				className
			)}
			{...props}
		/>
	);
}
