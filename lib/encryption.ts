import nacl from "tweetnacl";
import { convertPublicKey } from "ed2curve";

export interface EncryptedEmailPayload {
	encryptedEmail: Uint8Array;
	nonce: Uint8Array;
	x25519Pubkey: Uint8Array;
}

export function encryptEmailForWallet(
	email: string,
	walletPubkeyBytes: Uint8Array
): EncryptedEmailPayload {
	// Step 1: Convert Ed25519 → X25519
	const x25519Pubkey = convertPublicKey(walletPubkeyBytes);
	if (!x25519Pubkey) throw new Error("Failed to convert wallet key for encryption.");

	// Step 2: Ephemeral keypair
	const ephemeral = nacl.box.keyPair();

	// Step 3: Random nonce (24 bytes)
	const nonce = nacl.randomBytes(nacl.box.nonceLength);

	// Step 4: Encode email (once, correctly)
	const emailBytes = new TextEncoder().encode(email);

	// Step 5: Encrypt
	const ciphertext = nacl.box(emailBytes, nonce, x25519Pubkey, ephemeral.secretKey);
	if (!ciphertext) throw new Error("Encryption failed");

	// Step 6: Prepend ephemeral pubkey
	const encryptedEmail = new Uint8Array(nacl.box.publicKeyLength + ciphertext.length);
	encryptedEmail.set(ephemeral.publicKey, 0);
	encryptedEmail.set(ciphertext, nacl.box.publicKeyLength);

	return { encryptedEmail, nonce, x25519Pubkey };
}
