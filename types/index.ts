/** Notification delivery status */
export type NotificationStatus = "queued" | "processing" | "delivered" | "partial" | "failed" | "opted_out" | "digested";

/** Notification category */
export type NotificationCategory = "defi" | "governance" | "system" | "marketing";

/** A single notification record */
export interface Notification {
	id: string;
	protocolId: string;
	walletHash: string;
	status: NotificationStatus;
	category: NotificationCategory;
	subject?: string;
	queuedAt: string;
	deliveredAt?: string;
	receiptTx?: string;
  bounce?: boolean;
	errorCode?: string;
	ciphertext?: string;
	nonce?: string;
	message?: string;
	actionUrl?: string;
}

/** Registration wizard step identifiers */
export type RegistrationStep = "connect" | "email" | "encrypt" | "login" | "success";

/** Wallet info for display */
export interface WalletInfo {
	name: string;
	color: string;
}

export interface ProtocolSubscription {
	protocolId: string;
	status: 'active' | 'unsubscribed';
	channels: string[];
	subscribedAt: string;
	updatedAt: string;
	protocol: {
		name: string | null;
		logoUrl: string | null;
		websiteUrl: string | null;
		categories: string[];
	};
}

export interface DiscoverableProtocol {
	protocolId: string;
	name: string;
	logoUrl: string | null;
	websiteUrl: string | null;
	categories: string[];
	isSubscribed: boolean;
}

export interface IdentityStatus {
	registered: boolean;
	optIns?: {
		all: boolean;
		defi: boolean;
		governance: boolean;
		marketing: boolean;
	} | null;
	digestMode: boolean;
	registeredAt?: string | null;
	channels?: {
		email: boolean;
		telegram: boolean;
		sms: boolean;
	};
	notificationKey?: {
		version: number;
		rotationCount: number;
		updatedAt: number;
	} | null;
}
