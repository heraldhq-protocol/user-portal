"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { UserClient, type SolanaCluster } from "@herald-protocol/sdk";
import { Transaction } from "@solana/web3.js";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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

	// auto reset state on open/close
	if (!isOpen && step !== 1) setStep(1);
	if (!isOpen && confirmText !== "") setConfirmText("");

	const handleDelete = async () => {
		if (!walletContext.publicKey || !walletContext.signTransaction) return;

		setIsDeleting(true);
		try {
			const userClient = new UserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});
			const ix = await userClient.deleteIdentity({ owner: walletContext.publicKey });
			const tx = new Transaction().add(ix);
			tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			tx.feePayer = walletContext.publicKey;

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

			toast.success("Account permanently deleted");
			onClose();
			window.location.href = "/";
		} catch (err: unknown) {
			console.error("Delete error:", err);
			toast.error((err as { message?: string }).message || "Failed to delete account");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={(val) => !val && onClose()}>
			<div className="text-xl font-extrabold mb-2.5">
				{step === 1 ? "Delete account?" : "Confirm Deletion"}
			</div>
			{step === 1 ? (
				<>
					<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed mb-6">
						This permanently removes your on-chain IdentityAccount and returns the rent to your
						wallet. All future notifications to this wallet will be silently dropped. This action
						cannot be undone.
					</p>
					<div className="flex gap-3">
						<Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>
							Cancel
						</Button>
						<Button
							className="flex-1 justify-center bg-red bg-opacity-70 hover:bg-opacity-100 border border-red text-white"
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
							disabled={confirmText !== "DELETE" || isDeleting}
							onClick={handleDelete}
							className="flex-1 justify-center bg-red bg-opacity-70 hover:bg-opacity-100 border border-red text-white disabled:opacity-50"
						>
							{isDeleting ? "Deleting..." : "Delete My Account"}
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
}
