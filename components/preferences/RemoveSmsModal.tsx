/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { Modal, ModalTitle } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { ChannelUserClient, type SolanaCluster } from "@herald-protocol/sdk";

interface RemoveSmsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export function RemoveSmsModal({ isOpen, onClose, onSuccess }: RemoveSmsModalProps) {
	const walletContext = useWallet();
	const { connection } = useConnection();
	const [isRemoving, setIsRemoving] = useState(false);

	const handleRemove = async () => {
		if (!walletContext.publicKey || !walletContext.signTransaction) return;

		setIsRemoving(true);
		try {
			const client = new ChannelUserClient({
				cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
				rpcUrl: connection.rpcEndpoint,
			});

			const ix = await client.removeChannel({
				owner: walletContext.publicKey,
				channel: "sms",
			});

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

			// Sync changes (off-chain) so that status clears out
			await fetchApi("/portal/identity", { method: "POST" });

			toast.success("SMS alerts disabled for your identity");
			onClose();
			if (onSuccess) onSuccess();
		} catch (err: any) {
			console.error("Remove SMS error:", err);
			toast.error(err.message || "Failed to disconnect SMS");
		} finally {
			setIsRemoving(false);
		}
	};

	return (
		<Modal
			open={isOpen}
			onOpenChange={(val) => !val && onClose()}
			className="bg-red-100 border-red-500"
		>
			<ModalTitle className="text-xl font-extrabold mb-2.5">Disable SMS Alerts</ModalTitle>
			<p className="text-sm text-slate-500 dark:text-text-muted leading-relaxed mb-6">
				This will permanently remove your encrypted phone number from the blockchain. You will no
				longer receive SMS alerts.
			</p>
			<div className="flex gap-3">
				<Button
					variant="secondary"
					className="text-sm flex-1 justify-center"
					onClick={onClose}
					disabled={isRemoving}
				>
					Cancel
				</Button>
				<Button
					variant="danger"
					disabled={isRemoving}
					className="text-sm flex-1 justify-center"
					onClick={handleRemove}
				>
					{isRemoving ? "Removing..." : "Remove SMS"}
				</Button>
			</div>
		</Modal>
	);
}
