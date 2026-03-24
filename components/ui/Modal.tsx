"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
	/** Optional className for the content panel */
	className?: string;
	/** Optional danger styling (red border) */
	danger?: boolean;
}

export function Modal({ open, onOpenChange, children, className, danger = false }: ModalProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<DialogPrimitive.Portal forceMount>
						<DialogPrimitive.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-md"
							/>
						</DialogPrimitive.Overlay>
						<DialogPrimitive.Content asChild>
							<motion.div
								initial={{ scale: 0.95, opacity: 0, y: 10 }}
								animate={{ scale: 1, opacity: 1, y: 0 }}
								exit={{ scale: 0.95, opacity: 0, y: 10 }}
								transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
								className={cn(
									"fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2",
									"rounded-[24px] bg-card/70 backdrop-blur-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]",
									danger ? "border border-herald-red/40" : "border border-border/60",
									className
								)}
							>
								{/* Subtle top edge highlight */}
								<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-[24px]" />
								{children}
							</motion.div>
						</DialogPrimitive.Content>
					</DialogPrimitive.Portal>
				)}
			</AnimatePresence>
		</DialogPrimitive.Root>
	);
}

export const ModalTitle = DialogPrimitive.Title;
export const ModalDescription = DialogPrimitive.Description;
export const ModalClose = DialogPrimitive.Close;
