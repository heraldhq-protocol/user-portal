"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { emailUpdateSchema, type EmailUpdateFormData } from "@/lib/schemas";
import { encryptEmailForWallet } from "@/lib/encryption";
import { buildUpdateIdentityTx } from "@/lib/anchor";

interface EmailUpdateModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function EmailUpdateModal({ isOpen, onClose }: EmailUpdateModalProps) {
	const walletContext = useWallet();
	const { connection } = useConnection();
	const [isEncrypting, setIsEncrypting] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<EmailUpdateFormData>({
		resolver: zodResolver(emailUpdateSchema),
	});

	const onSubmit = async (data: EmailUpdateFormData) => {
		if (!walletContext.publicKey || !walletContext.signTransaction) return;

		try {
			setIsSubmitting(true);
			setIsEncrypting(true);

			const { encryptedEmail, nonce } = encryptEmailForWallet(
				data.newEmail,
				walletContext.publicKey.toBytes()
			);
			setIsEncrypting(false);

			const tx = await buildUpdateIdentityTx(connection, walletContext, {
				encryptedEmail,
				nonce,
			});

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

			toast.success("Email updated successfully");
			reset();
			onClose();
		} catch (err: unknown) {
			console.error("Update email error:", err);
			toast.error((err as { message?: string }).message || "Failed to update email");
		} finally {
			setIsSubmitting(false);
			setIsEncrypting(false);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={(val) => !val && onClose()}>
			<div className="text-xl font-extrabold mb-4">Update Email Address</div>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<div>
					<label className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
						New Email
					</label>
					<Input {...register("newEmail")} placeholder="alice@example.com" />
					{errors.newEmail?.message && (
						<span className="text-red text-xs mt-1 block">{errors.newEmail.message}</span>
					)}
				</div>
				<div>
					<label className="text-[13px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block">
						Confirm Email
					</label>
					<Input {...register("confirmEmail")} placeholder="alice@example.com" />
					{errors.confirmEmail?.message && (
						<span className="text-red text-xs mt-1 block">{errors.confirmEmail.message}</span>
					)}
				</div>

				<div className="flex gap-3 mt-4">
					<Button
						variant="secondary"
						className="flex-1 justify-center"
						onClick={onClose}
						type="button"
					>
						Cancel
					</Button>
					<Button className="flex-1 justify-center" type="submit" disabled={isSubmitting}>
						{isEncrypting ? "Encrypting..." : isSubmitting ? "Signing..." : "Update Email"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
