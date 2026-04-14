/** Notification delivery status */
export type NotificationStatus = "queued" | "processing" | "delivered" | "failed" | "opted_out";

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
	bounce?: string;
	errorCode?: string;
}

/** Registration wizard step identifiers */
export type RegistrationStep = "connect" | "email" | "encrypt" | "login" | "success";

/** Wallet info for display */
export interface WalletInfo {
	name: string;
	color: string;
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
}
