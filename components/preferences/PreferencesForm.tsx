"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { preferencesSchema, type PreferencesFormData } from "@/lib/schemas";
import { CategoryToggle } from "./CategoryToggle";
import { DeliveryModeSelect } from "./DeliveryModeSelect";
import { Transaction } from "@solana/web3.js";
import { fetchApi } from "@/lib/api";
import { useSolBalance } from "@/hooks/useSolBalance";

interface PreferencesFormProps {
	initialValues: PreferencesFormData;
}

const CATEGORIES = [
	{ key: "optInAll", label: "All notifications", desc: "Subscribe to every category" },
	{ key: "optInDefi", label: "DeFi alerts", desc: "Liquidation warnings, health factor alerts" },
	{ key: "optInGovernance", label: "Governance", desc: "DAO votes, proposals, quorum alerts" },
	{ key: "optInMarketing", label: "Marketing", desc: "Product updates, newsletters" },
] as const;

export function PreferencesForm({ initialValues }: PreferencesFormProps) {
	const walletContext = useWallet();
	const { connection } = useConnection();
	const { checkAndAirdrop } = useSolBalance();
	const [isSaving, setIsSaving] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { isDirty },
		reset,
	} = useForm<PreferencesFormData>({
		resolver: zodResolver(preferencesSchema),
		defaultValues: initialValues,
	});

	const onSubmit = async (data: PreferencesFormData) => {
		if (!walletContext.publicKey || !walletContext.signTransaction) {
			toast.error("Wallet not connected");
			return;
		}

		setIsSaving(true);
		try {
			// Check SOL balance before proceeding
			await checkAndAirdrop(0.01);

			// Step 1: Request pre-built transaction from backend
			const { serializedTransaction } = await fetchApi<{ serializedTransaction: string }>(
				"/portal/preferences/transaction",
				{
					method: "POST",
					body: JSON.stringify(data),
				}
			);

			// Step 2: Deserialize, sign, and send
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

			// Step 3: Sync to backend database (off-chain)
			await fetchApi("/portal/preferences", {
				method: "PATCH",
				body: JSON.stringify(data),
			});

			toast.success("Preferences saved on-chain and synced to dashboard");
			reset(data); // reset isDirty
		} catch (err: unknown) {
			console.error("Save preferences error:", err);
			toast.error((err as { message?: string }).message || "Failed to save preferences");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Card className="mb-4">
				<h3 className="text-[13px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-1">
					Notification categories
				</h3>
				{CATEGORIES.map(({ key, label, desc }) => (
					<Controller
						key={key}
						name={key}
						control={control}
						render={({ field }) => (
							<CategoryToggle
								label={label}
								description={desc}
								checked={field.value}
								onChange={field.onChange}
							/>
						)}
					/>
				))}
			</Card>

			<Card className="mb-6">
				<h3 className="text-[13px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-widest mb-4">
					Delivery mode
				</h3>
				<Controller
					name="digestMode"
					control={control}
					render={({ field }) => (
						<DeliveryModeSelect value={field.value} onChange={field.onChange} />
					)}
				/>
			</Card>

			<Button type="submit" className="w-full justify-center mb-8" disabled={isSaving || !isDirty}>
				{isSaving ? "Awaiting Signature..." : "Save changes (requires signature)"}
			</Button>
		</form>
	);
}
