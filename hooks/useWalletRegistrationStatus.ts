"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { ReadClient } from "@herald-protocol/sdk/read";

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
				const programId = process.env.NEXT_PUBLIC_HERALD_PROGRAM_ID;
				if (!programId) {
					throw new Error("NEXT_PUBLIC_HERALD_PROGRAM_ID not set");
				}

				const readClient = new ReadClient({
					rpcUrl: connection.rpcEndpoint,
					programId,
					commitment: "confirmed",
				});

				const isRegistered = await readClient.isRegistered(publicKey);

				return { registered: isRegistered };
			} catch (err) {
				console.error("Failed to get registration status:", err);
				throw err;
			}
		},
		enabled: !!publicKey,
		staleTime: 30000,
	});
}
