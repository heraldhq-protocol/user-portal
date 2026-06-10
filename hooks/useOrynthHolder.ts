"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { PublicKey } from "@solana/web3.js";

const ORYNTH_HERALD_MINT = new PublicKey("3ifTB4CtomDdMtMPNVaVZ6ViT8oUXenk9qZbrY4KMory");

/** Returns true if the connected wallet holds any amount of the Herald-Orynth market token. */
export function useOrynthHolder() {
	const { publicKey } = useWallet();
	const { connection } = useConnection();

	return useQuery({
		queryKey: ["orynthHolder", publicKey?.toBase58()],
		queryFn: async (): Promise<boolean> => {
			if (!publicKey) return false;
			const { value: accounts } = await connection.getParsedTokenAccountsByOwner(
				publicKey,
				{ mint: ORYNTH_HERALD_MINT },
			);
			return accounts.some(
				(a) =>
					(a.account.data as { parsed: { info: { tokenAmount: { uiAmount: number | null } } } })
						.parsed.info.tokenAmount.uiAmount ?? 0 > 0,
			);
		},
		enabled: !!publicKey,
		staleTime: 60_000,
	});
}
