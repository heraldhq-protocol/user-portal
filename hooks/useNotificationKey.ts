/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { NotificationKeyClient, SolanaCluster } from "@herald-protocol/sdk";
import { shouldUseSandboxEncryption, getSandboxEnclavePubkey } from "@/lib/crypto";

export function useNotificationKey() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClient = () => {
    return new NotificationKeyClient({
      cluster: (process.env.NEXT_PUBLIC_RPC_CLUSTER as SolanaCluster) || "devnet",
      rpcUrl: connection.rpcEndpoint,
    });
  };

  /** Sandbox-aware enclave pubkey override. */
  const getOverridePubkey = (): Uint8Array | undefined => {
    return shouldUseSandboxEncryption() ? getSandboxEnclavePubkey() : undefined;
  };

  /**
   * Register a new notification key.
   * Assumes the user identity is already registered.
   */
  const registerKey = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signMessage) {
      throw new Error("Wallet not connected or does not support message/transaction signing");
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = getClient();
      const overridePubkey = getOverridePubkey();

      const { ix } = await client.buildRegisterKeyIx(
        wallet as any,
        overridePubkey
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(ix);

      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    } catch (err: any) {
      console.error("Failed to register notification key:", err);
      setError(err.message || "Unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Rotate an existing notification key.
   */
  const rotateKey = async () => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signMessage) {
      throw new Error("Wallet not connected or does not support signing");
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = getClient();
      const overridePubkey = getOverridePubkey();

      const { ix } = await client.buildRotateKeyIx(
        wallet as any,
        overridePubkey
      );

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(ix);

      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    } catch (err: any) {
      console.error("Failed to rotate notification key:", err);
      setError(err.message || "Unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Revoke an existing notification key.
   */
  const revokeKey = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = getClient();
      const ix = await client.buildRevokeKeyIx(wallet.publicKey);

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(ix);

      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    } catch (err: any) {
      console.error("Failed to revoke notification key:", err);
      setError(err.message || "Unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Migrate account to support notification keys if it's an old account
   */
  const migrateKeySpace = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    setError(null);
    try {
      const client = getClient();
      const ix = await client.buildMigrateSpaceIx(wallet.publicKey);

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      }).add(ix);

      const signedTx = await wallet.signTransaction(tx);
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      return signature;
    } catch (err: any) {
      console.error("Failed to migrate notification key space:", err);
      setError(err.message || "Unknown error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerKey,
    rotateKey,
    revokeKey,
    migrateKeySpace,
    isLoading,
    error,
  };
}
