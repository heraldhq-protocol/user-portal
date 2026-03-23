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
								className="fixed inset-0 z-50 bg-navy/85 backdrop-blur-sm"
							/>
						</DialogPrimitive.Overlay>
						<DialogPrimitive.Content asChild>
							<motion.div
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.9, opacity: 0 }}
								transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
								className={cn(
									"fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2",
									"rounded-2xl bg-card p-6",
									danger ? "border border-herald-red/30" : "border border-border",
									className
								)}
							>
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
