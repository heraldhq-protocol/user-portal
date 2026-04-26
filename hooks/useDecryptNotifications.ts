/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { NotificationKeyClient } from "@herald-protocol/sdk";
import type { EncryptedNotification, DecryptedNotification } from "@herald-protocol/sdk";
import { shouldUseSandboxEncryption, getSandboxEnclavePubkey } from "@/lib/crypto";

export function useDecryptNotifications() {
  const wallet = useWallet();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decryptNotifications = async (
    notifications: EncryptedNotification[]
  ): Promise<DecryptedNotification[]> => {
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error("Wallet not connected or does not support message signing");
    }

    if (notifications.length === 0) return [];

    setIsDecrypting(true);
    setError(null);
    try {
      const overridePubkey = shouldUseSandboxEncryption()
        ? getSandboxEnclavePubkey()
        : undefined;

      const client = new NotificationKeyClient({
        cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as any) || "devnet",
        rpcUrl: "", // RPC not needed for pure crypto
      });

      // The SDK client signs the message once and derives the key,
      // then uses it to decrypt all notifications.
      const decrypted = await client.decryptBatch(
        wallet as any,
        notifications,
        overridePubkey
      );

      return decrypted;
    } catch (err: any) {
      console.error("Failed to decrypt notifications:", err);
      setError(err.message || "Unknown error occurred during decryption");
      throw err;
    } finally {
      setIsDecrypting(false);
    }
  };

  return {
    decryptNotifications,
    isDecrypting,
    error,
  };
}
