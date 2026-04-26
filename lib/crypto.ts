/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nacl from 'tweetnacl';
import { decodeUTF8, decodeBase64 } from 'tweetnacl-util';
import { encryptEmail as sdkEncryptEmail } from '@herald-protocol/sdk';
import type { PublicKey } from '@solana/web3.js';

/**
 * Check if the current environment should use sandbox (symmetric) encryption
 * instead of the AWS KMS (asymmetric) encryption provided by the SDK.
 */
export function shouldUseSandboxEncryption(): boolean {
	return (
		process.env.NEXT_PUBLIC_ENCLAVE_MODE === 'sandbox' ||
		process.env.NEXT_PUBLIC_RPC_CLUSTER === 'devnet' ||
		process.env.NEXT_PUBLIC_RPC_CLUSTER === 'localhost'
	);
}

/**
 * Returns the sandbox enclave X25519 pubkey for dev/test environments.
 *
 * Priority:
 *   1. NEXT_PUBLIC_ENCLAVE_TEST_PUBKEY_HEX (env override)
 *   2. Deterministic fallback keypair derived from a fixed seed
 *
 * The fallback ensures `sealNotificationKey` works out-of-the-box
 * in sandbox mode without extra env config.
 */
export function getSandboxEnclavePubkey(): Uint8Array {
	const devKeyHex = process.env.NEXT_PUBLIC_ENCLAVE_TEST_PUBKEY_HEX;
	if (devKeyHex) {
		return new Uint8Array(Buffer.from(devKeyHex, 'hex'));
	}

	// Deterministic fallback: derive from a fixed 32-byte seed.
	// This matches the test key the notification gateway uses in sandbox mode.
	const seed = new Uint8Array(32);
	const seedStr = 'herald-sandbox-enclave-test-key!'; // exactly 32 ASCII chars
	for (let i = 0; i < 32; i++) {
		seed[i] = seedStr.charCodeAt(i);
	}
	const keypair = nacl.box.keyPair.fromSecretKey(seed);
	return keypair.publicKey;
}

/**
 * Conditionally encrypt an email address.
 *
 * - **Sandbox/Devnet/Local**: Uses `nacl.secretbox` (symmetric) with `NEXT_PUBLIC_ENCLAVE_TEST_KEY`
 *   so the Notification Gateway can decrypt it end-to-end without AWS Nitro Enclaves.
 * - **Production/Mainnet**: Uses the official `@herald-protocol/sdk` (asymmetric AWS KMS integration)
 */
export async function encryptEmail(
	email: string,
	pubkey: PublicKey,
): Promise<{ encryptedEmail: Uint8Array; nonce: Uint8Array }> {
	if (shouldUseSandboxEncryption()) {
		// Use symmetric encryption for testing to match what the gateway expects
		const testKeyBase64 =
			process.env.NEXT_PUBLIC_ENCLAVE_TEST_KEY || 'kkNlpXYSlFFy1m7lLCXiBTaX9pH/h7fmrhZvprITd5w='; // Default fallback from gateway config

		let key: Uint8Array;
		try {
			key = decodeBase64(testKeyBase64);
		} catch {
			console.warn('Invalid NEXT_PUBLIC_ENCLAVE_TEST_KEY format. Using fallback zero-key.');
			key = new Uint8Array(32);
		}

		const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
		const messageUint8 = decodeUTF8(email);
		const encryptedEmail = nacl.secretbox(messageUint8, nonce, key);

		return { encryptedEmail, nonce };
	}

	// Production: Use secure AWS KMS via the SDK
	const result = await Promise.resolve(sdkEncryptEmail(email, pubkey));
	return result;
}

export async function sealNotificationKey(wallet: any) {
	const overridePubkey = shouldUseSandboxEncryption()
		? getSandboxEnclavePubkey()
		: undefined;

	const { sealX25519PubkeyForEnclave } = await import('@herald-protocol/sdk');
	return await sealX25519PubkeyForEnclave(wallet, overridePubkey);
}

export async function decryptNotificationPayload(
	wallet: any,
	ciphertextHex: string,
	nonceHex: string,
) {
	const overridePubkey = shouldUseSandboxEncryption()
		? getSandboxEnclavePubkey()
		: undefined;

	const { decryptNotificationBody } = await import('@herald-protocol/sdk');
	return await decryptNotificationBody(
		wallet,
		new Uint8Array(Buffer.from(ciphertextHex, 'hex')),
		new Uint8Array(Buffer.from(nonceHex, 'hex')),
		overridePubkey,
	);
}
