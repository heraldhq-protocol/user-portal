import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program, type Wallet } from '@coral-xyz/anchor';
import type { WalletContextState } from '@solana/wallet-adapter-react';

// The Herald program's Anchor IDL type — matches the on-chain Anchor program
// HERALD_PROGRAM_ID comes from env variable set in .env.local
const HERALD_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_HERALD_PROGRAM_ID ?? 'HrLd1111111111111111111111111111111111111111',
);

/**
 * Derive the user's IdentityAccount PDA address.
 * Seeds: ["identity", walletPubkey]
 * One PDA per wallet — deterministic.
 */
export function deriveIdentityPDA(walletPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('identity'), walletPubkey.toBuffer()],
    HERALD_PROGRAM_ID,
  );
}

/**
 * Build a `register_identity` transaction (unsigned).
 * Caller must sign the transaction with their wallet.
 *
 * @param connection - Solana RPC connection
 * @param wallet - Connected wallet (from useWallet hook)
 * @param encryptedEmail - encrypted bytes (from encryptEmailForWallet)
 * @param nonce - 24-byte nonce (from encryptEmailForWallet)
 * @param optIns - user notification preferences
 * @param digestMode - true = daily digest, false = real-time
 */
export async function buildRegisterIdentityTx(
  connection: Connection,
  wallet: WalletContextState,
  encryptedEmail: Uint8Array,
  nonce: Uint8Array,
  optIns: { defi: boolean; governance: boolean; system: boolean; marketing: boolean },
  digestMode: boolean,
): Promise<Transaction> {
  const publicKey = wallet.publicKey;
  if (!publicKey) throw new Error('Wallet not connected');

  // MOCK: IDL is missing, simulate the transaction
  // const provider = new AnchorProvider(connection, wallet as unknown as Wallet, { commitment: 'confirmed' });
  // // @ts-expect-error - IDL import handled at runtime
  // const program = new Program(await import('../idl/herald.json'), provider);

  // const emailHash = await computeEmailHash(encryptedEmail);

  // const tx = await program.methods
  //   .registerIdentity(
  //     Array.from(encryptedEmail),
  //     Array.from(nonce),
  //     Array.from(emailHash),
  //     optIns.defi,
  //     optIns.governance,
  //     optIns.system,
  //     optIns.marketing,
  //     digestMode
  //   )
  //   .accounts({ owner: publicKey })
  //   .transaction();

  // Create a dummy transaction for the wallet to sign
  const tx = new Transaction().add({
    keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
    programId: HERALD_PROGRAM_ID,
    data: Buffer.from('mock register_identity'),
  });

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = publicKey;
  return tx;
}

/** Build an `update_identity` transaction (for preferences changes). */
export async function buildUpdateIdentityTx(
  connection: Connection,
  wallet: WalletContextState,
  updates: {
    encryptedEmail?: Uint8Array;
    nonce?: Uint8Array;
    optIns?: { defi: boolean; governance: boolean; system: boolean; marketing: boolean };
    digestMode?: boolean;
  },
): Promise<Transaction> {
  const publicKey = wallet.publicKey;
  if (!publicKey) throw new Error('Wallet not connected');
  //FIXME: ONCE THE IDL IS READY, REMOVE THIS MOCK
  // MOCK: IDL is missing
  // const provider = new AnchorProvider(connection, wallet as unknown as Wallet, { commitment: 'confirmed' });
  // // @ts-expect-error - IDL import handled at runtime
  // const program = new Program(await import('../idl/herald.json'), provider);

  // const tx = await program.methods
  //   .updateIdentity(
  //     updates.encryptedEmail ? Array.from(updates.encryptedEmail) : null,
  //     updates.nonce ? Array.from(updates.nonce) : null,
  //     updates.optIns?.defi ?? null,
  //     updates.optIns?.governance ?? null,
  //     updates.optIns?.system ?? null,
  //     updates.optIns?.marketing ?? null,
  //     updates.digestMode ?? null
  //   )
  //   .accounts({ owner: publicKey })
  //   .transaction();

  const tx = new Transaction().add({
    keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
    programId: HERALD_PROGRAM_ID,
    data: Buffer.from('mock update_identity'),
  });

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = publicKey;
  return tx;
}

/** Build a `delete_identity` transaction. GDPR right to erasure. */
export async function buildDeleteIdentityTx(
  connection: Connection,
  wallet: WalletContextState,
): Promise<Transaction> {
  const publicKey = wallet.publicKey;
  if (!publicKey) throw new Error('Wallet not connected');
  // MOCK: IDL is missing
  // const provider = new AnchorProvider(connection, wallet as unknown as Wallet, { commitment: 'confirmed' });
  // // @ts-expect-error - IDL import handled at runtime
  // const program = new Program(await import('../idl/herald.json'), provider);

  // const tx = await program.methods
  //   .deleteIdentity()
  //   .accounts({ owner: publicKey })
  //   .transaction();

  const tx = new Transaction().add({
    keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
    programId: HERALD_PROGRAM_ID,
    data: Buffer.from('mock delete_identity'),
  });

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = publicKey;
  return tx;
}

/** SHA-256 hash of bytes (runs in browser via SubtleCrypto). */
async function computeEmailHash(data: Uint8Array): Promise<Uint8Array> {
  const plain = new Uint8Array(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', plain);
  return new Uint8Array(hashBuffer);
}
