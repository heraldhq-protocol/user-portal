import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoaderProps {
	message?: string;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function Loader({ message = "Loading...", className, size = "md" }: LoaderProps) {
	const sizeClasses = {
		sm: "w-6 h-6 border-2",
		md: "w-10 h-10 border-3",
		lg: "w-16 h-16 border-4",
	};

	const spinnerSize = sizeClasses[size] || sizeClasses.md;

	return (
		<div className={cn("flex flex-col items-center justify-center py-12", className)}>
			<div className="relative flex items-center justify-center">
				{/* Background track */}
				<div className={cn("absolute rounded-full border-teal/10", spinnerSize)} />

				{/* Spinning glowing arc */}
				<motion.div
					className={cn(
						"rounded-full border-transparent border-t-teal border-l-teal/50 shadow-[0_0_15px_rgba(0,200,150,0.4)]",
						spinnerSize
					)}
					animate={{ rotate: 360 }}
					transition={{
						duration: 1.2,
						repeat: Infinity,
						ease: "linear",
					}}
				/>
			</div>

			{message && (
				<motion.div
					initial={{ opacity: 0.5 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
					className="mt-5 text-[13px] font-medium tracking-wide text-text-muted uppercase"
				>
					{message}
				</motion.div>
			)}
		</div>
	);
}
