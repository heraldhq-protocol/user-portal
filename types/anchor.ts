/**
 * Anchor program types for the Herald on-chain identity system.
 */

/** On-chain IdentityAccount PDA — seeds: ["identity", owner_pubkey] */
export interface IdentityAccount {
	owner: string;
	encryptedEmail: number[];
	emailHash: number[];
	nonce: number[];
	registeredAt: number;
	optInDefi: boolean;
	optInGovernance: boolean;
	optInSystem: boolean;
	optInMarketing: boolean;
	digestMode: boolean;
	bump: number;
}

/** On-chain ProtocolRegistryAccount */
export interface ProtocolRegistryAccount {
	authority: string;
	protocolName: string;
	tier: number;
	isActive: boolean;
	registeredAt: number;
	bump: number;
}

/** Result from the encryptEmailForWallet function */
export interface EncryptionResult {
	encryptedEmail: Uint8Array;
	nonce: Uint8Array;
	emailHash: Uint8Array;
}

/** Opt-in preferences for notification categories */
export interface OptInPreferences {
	optInDefi: boolean;
	optInGovernance: boolean;
	optInSystem: boolean;
	optInMarketing: boolean;
	digestMode: boolean;
}
