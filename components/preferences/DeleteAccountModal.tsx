"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { Modal, ModalTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface DeleteAccountModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
	const walletContext = useWallet();
	const { connection } = useConnection();
	const [step, setStep] = useState<1 | 2>(1);
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const { logout } = useAuth();

	// auto reset state on open/close
	if (!isOpen && step !== 1) setStep(1);
	if (!isOpen && confirmText !== "") setConfirmText("");

	const handleDelete = async () => {
		if (!walletContext.publicKey || !walletContext.signTransaction) return;

		setIsDeleting(true);
		try {
			// 1. Build transaction in backend
			const { serializedTransaction } = await fetchApi<{ serializedTransaction: string }>(
				"/portal/delete/transaction",
				{
					method: "POST",
				}
			);

			// 2. Sign and send
			const tx = Transaction.from(Buffer.from(serializedTransaction, "base64"));
			const signedTx = await walletContext.signTransaction(tx);
			const signature = await connection.sendRawTransaction(signedTx.serialize());

			const latestBlockhash = await connection.getLatestBlockhash();
			await connection.confirmTransaction(
				{
					signature,
					blockhash: latestBlockhash.blockhash,
					lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				},
				"confirmed"
			);

			// 3. Cleanup off-chain data
			await fetchApi("/portal/account", { method: "DELETE" });

			toast.success("Account permanently deleted");

			logout();
			onClose();
			window.location.replace("/");
		} catch (err: unknown) {
			console.error("Delete error:", err);
			toast.error((err as { message?: string }).message || "Failed to delete account");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Modal
			open={isOpen}
			onOpenChange={(val) => !val && onClose()}
			className="bg-red-100 border-red-500"
		>
			<ModalTitle className="text-xl font-extrabold mb-2.5">
				{step === 1 ? "Delete account?" : "Confirm Deletion"}
			</ModalTitle>
			{step === 1 ? (
				<>
					<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed mb-6">
						This permanently removes your on-chain IdentityAccount and returns the rent to your
						wallet. All future notifications to this wallet will be silently dropped. This action
						cannot be undone.
					</p>
					<div className="flex gap-3">
						<Button variant="secondary" className="text-sm flex-1 justify-center" onClick={onClose}>
							Cancel
						</Button>
						<Button
							variant={"danger"}
							className="text-sm flex-1 justify-center"
							onClick={() => setStep(2)}
						>
							I understand, continue →
						</Button>
					</div>
				</>
			) : (
				<>
					<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed mb-4">
						Type <strong>DELETE</strong> below to confirm permanent deletion.
					</p>
					<input
						type="text"
						className="w-full bg-white dark:bg-navy border border-slate-200 dark:border-border rounded-lg px-4 py-3 text-white mb-6 outline-none focus:border-red"
						placeholder="DELETE"
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
					/>
					<div className="flex gap-3">
						<Button
							variant="secondary"
							className="flex-1 justify-center"
							onClick={() => setStep(1)}
						>
							Back
						</Button>
						<Button
							variant={"danger"}
							disabled={confirmText !== "DELETE" || isDeleting}
							onClick={handleDelete}
							className="text-sm flex-1 justify-center"
						>
							{isDeleting ? "Deleting..." : "Delete My Account"}
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
}
