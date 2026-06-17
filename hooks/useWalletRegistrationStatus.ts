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

				const account = await readClient.fetchIdentityAccount(publicKey);
				if (!account) {
					return { registered: false };
				}

				const hasNotifKey =
					account.notificationKeyVersion &&
					account.notificationKeyVersion > 0 &&
					account.sealedX25519Pubkey &&
					!account.sealedX25519Pubkey.every((b: number) => b === 0);

				return {
					registered: true,
					notificationKey: hasNotifKey ? {
						version: account.notificationKeyVersion,
						rotationCount: account.notificationKeyRotationCount,
						updatedAt: account.notificationKeyUpdatedAt
					} : null
				};
			} catch (err) {
				// A fetch error for a brand-new wallet (no on-chain account yet) must
				// not block the wizard. Treat any RPC/SDK error as "not registered" so
				// the user can proceed; re-registration on an existing wallet will
				// fail on-chain with "already in use" which is already handled.
				console.warn("Failed to get registration status — treating as unregistered:", err);
				return { registered: false };
			}
		},
		enabled: !!publicKey,
		staleTime: 30000,
		retry: false,
	});
}
