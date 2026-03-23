"use client";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Modal, ModalDescription, ModalTitle } from "@/components/ui/Modal";

interface WalletModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
	const { wallets, select, connecting } = useWallet();

	const handleWalletClick = (walletName: string) => {
		// select() automatically connects if the adapter supports it,
		// or sets it up for connect() call later. For standard use,
		// selecting a wallet often triggers the extension popup.
		select(walletName as WalletName);
		onClose();
	};

	return (
		<Modal open={isOpen} onOpenChange={onClose}>
			<div className="mb-6">
				<ModalTitle className="text-xl font-extrabold mb-2">Connect Wallet</ModalTitle>
				<ModalDescription className="text-sm text-text-muted">
					Select a Solana wallet account structure to authenticate and manage your Herald settings.
				</ModalDescription>
			</div>

			<div className="flex flex-col gap-3">
				{wallets.map((wallet) => {
					const isDetected = wallet.readyState === "Installed" || wallet.readyState === "Loadable";

					return (
						<button
							key={wallet.adapter.name}
							onClick={() => handleWalletClick(wallet.adapter.name)}
							disabled={connecting}
							className="flex items-center gap-4 p-4 rounded-xl border border-border bg-navy/50 hover:border-teal/50 hover:bg-card-2 transition-all text-left"
						>
							{/* Next.js Image component not strictly required here since adapter gives standard URL */}
							<Image
								src={wallet.adapter.icon}
								alt={`${wallet.adapter.name} icon`}
								className="w-8 h-8 object-contain rounded-md"
							/>
							<div className="flex-1 flex items-center justify-between">
								<span className="font-bold text-[15px]">{wallet.adapter.name}</span>
								{isDetected ? (
									<span className="text-[10px] uppercase font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full">
										Detected
									</span>
								) : null}
							</div>
						</button>
					);
				})}
			</div>

			<div className="mt-6 flex gap-3">
				<Button variant="secondary" className="w-full" onClick={onClose}>
					Cancel
				</Button>
			</div>
		</Modal>
	);
}
