/* eslint-disable @typescript-eslint/no-explicit-any */
import * as nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8, decodeBase64 } from 'tweetnacl-util';
import { deriveX25519SecretFromEd25519 } from '@herald-protocol/sdk';
import type { PublicKey } from '@solana/web3.js';

// ─── Dual-encryption blob magic prefix ────────────────────────────────────────
// Blobs starting with these two bytes use the dual format:
//   [MAGIC(2)] [eph1(32)] [len(2 BE)] [gateway_ciphertext(len)] [eph2(32)] [user_ciphertext(len)]
// All other blobs are treated as legacy single-recipient (gateway-only) or secretbox.
const DUAL_MAGIC = Uint8Array.from([0xaa, 0xbb]);

// Max email byte length that fits both ciphertexts within the 200-byte on-chain limit.
// 2 (magic) + 32 (eph1) + 2 (len) + N+16 (cipher1) + 32 (eph2) + N+16 (cipher2) ≤ 200
// → N ≤ 50
const DUAL_MAX_EMAIL_BYTES = 50;

// ─── Environment helpers ───────────────────────────────────────────────────────

/**
 * Returns true when sandbox (symmetric) encryption should be used.
 * Sandbox mode is only for localhost or when explicitly set.
 * Devnet and mainnet both use production X25519 encryption.
 */
export function shouldUseSandboxEncryption(): boolean {
	return (
		process.env.NEXT_PUBLIC_ENCLAVE_MODE === 'sandbox' ||
		process.env.NEXT_PUBLIC_RPC_CLUSTER === 'localhost'
	);
}

/**
 * Returns the deterministic sandbox enclave X25519 pubkey.
 * Used when NEXT_PUBLIC_ENCLAVE_TEST_PUBKEY_HEX is not set.
 */
export function getSandboxEnclavePubkey(): Uint8Array {
	const devKeyHex = process.env.NEXT_PUBLIC_ENCLAVE_TEST_PUBKEY_HEX;
	if (devKeyHex) {
		return new Uint8Array(Buffer.from(devKeyHex, 'hex'));
	}
	const seed = new Uint8Array(32);
	const seedStr = 'herald-sandbox-enclave-test-key!';
	for (let i = 0; i < 32; i++) seed[i] = seedStr.charCodeAt(i);
	return nacl.box.keyPair.fromSecretKey(seed).publicKey;
}

/**
 * Returns the Herald gateway X25519 public key.
 * Production value set via NEXT_PUBLIC_HERALD_ENCLAVE_PUBKEY_HEX.
 */
export function getGatewayEnclavePubkey(): Uint8Array {
	const hex = process.env.NEXT_PUBLIC_HERALD_ENCLAVE_PUBKEY_HEX;
	if (hex) return new Uint8Array(Buffer.from(hex, 'hex'));
	return getSandboxEnclavePubkey();
}

// ─── Email encryption ──────────────────────────────────────────────────────────

/**
 * Encrypt an email address for on-chain storage.
 *
 * ## Sandbox mode (devnet / localhost / ENCLAVE_MODE=sandbox)
 * Uses `nacl.secretbox` with NEXT_PUBLIC_ENCLAVE_TEST_KEY.
 * The gateway decrypts with the same key. Single-recipient only.
 *
 * ## Production mode (mainnet)
 * Uses **dual encryption** when the email fits within 50 bytes:
 *   - Block 1 — encrypted to the Herald gateway pubkey → gateway can decrypt for notifications
 *   - Block 2 — encrypted to the user's wallet X25519 key → user can decrypt in-browser
 *
 * If the email exceeds 50 bytes, falls back to gateway-only encryption (user views
 * their email via the authenticated admin-api endpoint instead).
 *
 * ## Blob format (dual)
 * ```
 * [0xAA, 0xBB]          ← magic (2 bytes)
 * [ephemeral1_pub]       ← 32 bytes, sender for gateway block
 * [len as uint16 BE]     ← 2 bytes, length of each ciphertext block
 * [gateway_ciphertext]   ← len bytes
 * [ephemeral2_pub]       ← 32 bytes, sender for user block
 * [user_ciphertext]      ← len bytes
 * ```
 *
 * @param walletPubkey  The user's Solana wallet public key (Ed25519).
 *                      Used in production to derive the user's X25519 key for Block 2.
 */
export async function encryptEmail(
	email: string,
	walletPubkey: PublicKey,
): Promise<{ encryptedEmail: Uint8Array; nonce: Uint8Array }> {
	// ── Sandbox path ──────────────────────────────────────────────────────────
	if (shouldUseSandboxEncryption()) {
		const testKeyBase64 =
			process.env.NEXT_PUBLIC_ENCLAVE_TEST_KEY ||
			'kkNlpXYSlFFy1m7lLCXiBTaX9pH/h7fmrhZvprITd5w=';
		let key: Uint8Array;
		try {
			key = decodeBase64(testKeyBase64);
		} catch {
			console.warn('Invalid NEXT_PUBLIC_ENCLAVE_TEST_KEY. Using zero-key fallback.');
			key = new Uint8Array(32);
		}
		const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
		const encryptedEmail = nacl.secretbox(decodeUTF8(email), nonce, key);
		return { encryptedEmail, nonce };
	}

	// ── Production: dual encryption ───────────────────────────────────────────
	const emailBytes = decodeUTF8(email);
	const nonce = nacl.randomBytes(nacl.box.nonceLength); // 24 bytes, shared for both blocks

	const gatewayPubkey = getGatewayEnclavePubkey();

	// Derive user's X25519 public key from their Ed25519 wallet key.
	// The SDK exports this conversion — same library used in the portal.
	const { deriveX25519FromEd25519 } = await import('@herald-protocol/sdk');
	const userX25519Pubkey = deriveX25519FromEd25519(walletPubkey.toBytes());

	if (emailBytes.length <= DUAL_MAX_EMAIL_BYTES) {
		// ── Dual format: both gateway and user can decrypt ────────────────────
		const eph1 = nacl.box.keyPair();
		const eph2 = nacl.box.keyPair();

		const cipher1 = nacl.box(emailBytes, nonce, gatewayPubkey, eph1.secretKey);
		const cipher2 = nacl.box(emailBytes, nonce, userX25519Pubkey, eph2.secretKey);

		if (!cipher1 || !cipher2) throw new Error('Email dual-encryption failed');

		// Wipe ephemeral secrets from memory
		eph1.secretKey.fill(0);
		eph2.secretKey.fill(0);

		const len = cipher1.length; // both blocks are same length
		const lenBytes = new Uint8Array([len >> 8, len & 0xff]); // uint16 big-endian

		const blob = new Uint8Array(
			DUAL_MAGIC.length + 32 + 2 + len + 32 + len,
		);
		let offset = 0;
		blob.set(DUAL_MAGIC,       offset); offset += DUAL_MAGIC.length;
		blob.set(eph1.publicKey,   offset); offset += 32;
		blob.set(lenBytes,         offset); offset += 2;
		blob.set(cipher1,          offset); offset += len;
		blob.set(eph2.publicKey,   offset); offset += 32;
		blob.set(cipher2,          offset);

		return { encryptedEmail: blob, nonce };
	}

	// ── Fallback: gateway-only (email > 50 bytes, rare) ──────────────────────
	// User can view their email via GET /portal/email (authenticated admin-api).
	console.warn(
		`Email (${emailBytes.length} bytes) exceeds dual-encryption limit (${DUAL_MAX_EMAIL_BYTES}). ` +
		`Using gateway-only encryption. User can view email via the portal settings API.`,
	);
	const eph = nacl.box.keyPair();
	const cipher = nacl.box(emailBytes, nonce, gatewayPubkey, eph.secretKey);
	if (!cipher) throw new Error('Email encryption failed');

	const blob = new Uint8Array(32 + cipher.length);
	blob.set(eph.publicKey, 0);
	blob.set(cipher, 32);
	eph.secretKey.fill(0);

	return { encryptedEmail: blob, nonce };
}

// ─── User-side email decryption ────────────────────────────────────────────────

/**
 * Decrypt the user's stored email in the browser using their wallet secret key.
 *
 * Works with dual-format blobs (production) only.
 * Sandbox blobs (secretbox) cannot be decrypted here — use the admin-api.
 *
 * @param encryptedEmail  The encrypted blob from IdentityAccount.encrypted_email.
 * @param nonce           The 24-byte nonce from IdentityAccount.nonce.
 * @param walletSecretKey The user's Ed25519 secret key (64 bytes from wallet adapter).
 * @returns The plaintext email string, or null if decryption is not possible.
 */
export function decryptEmailForUser(
	encryptedEmail: Uint8Array,
	nonce: Uint8Array,
	walletSecretKey: Uint8Array,
): string | null {
	// Check for dual-encryption magic prefix
	if (
		encryptedEmail.length < DUAL_MAGIC.length ||
		encryptedEmail[0] !== DUAL_MAGIC[0] ||
		encryptedEmail[1] !== DUAL_MAGIC[1]
	) {
		// Not a dual-format blob. Sandbox/gateway-only blobs cannot be
		// decrypted by the user in-browser. Use GET /portal/email instead.
		return null;
	}

	try {
		let offset = DUAL_MAGIC.length;
		// Skip gateway block (ephemeral1 + len + cipher1)
		offset += 32; // ephemeral1_pub
		const len = (encryptedEmail[offset] << 8) | encryptedEmail[offset + 1];
		offset += 2;
		offset += len; // skip gateway ciphertext

		// Read user block
		const eph2Pub = encryptedEmail.slice(offset, offset + 32);
		offset += 32;
		const userCiphertext = encryptedEmail.slice(offset, offset + len);

		// Derive X25519 secret key from Ed25519 wallet key
		const x25519Secret = deriveX25519SecretFromEd25519(walletSecretKey);

		const decrypted = nacl.box.open(userCiphertext, nonce, eph2Pub, x25519Secret);
		if (!decrypted) return null;

		return encodeUTF8(decrypted);
	} catch {
		return null;
	}
}

/**
 * Returns true if an encrypted email blob uses the dual format
 * (both gateway and user can decrypt it).
 */
export function isDualEncryptedBlob(encryptedEmail: Uint8Array): boolean {
	return (
		encryptedEmail.length >= DUAL_MAGIC.length &&
		encryptedEmail[0] === DUAL_MAGIC[0] &&
		encryptedEmail[1] === DUAL_MAGIC[1]
	);
}

// ─── Notification key helpers ──────────────────────────────────────────────────

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
