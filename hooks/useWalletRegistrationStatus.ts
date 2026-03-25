"use client";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { findIdentityPda, HERALD_PROGRAM_ID } from "@herald-protocol/sdk";

export function useWalletRegistrationStatus() {
	const { publicKey } = useWallet();
	const { connection } = useConnection();

	return useQuery({
		queryKey: ["registrationStatus", publicKey?.toBase58()],
		queryFn: async () => {
			if (!publicKey) {
				return { registered: false, account: null };
			}
			try {
				const [pda] = findIdentityPda(publicKey, HERALD_PROGRAM_ID);
				const accountInfo = await connection.getAccountInfo(pda);

				if (!accountInfo) {
					return { registered: false, account: null };
				}

				return { registered: true, account: accountInfo };
			} catch (err) {
				console.error("Failed to get registration status:", err);
				return { registered: false, account: null };
			}
		},
		enabled: !!publicKey,
		staleTime: 30000,
	});
}
