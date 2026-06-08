import {
	BaseMessageSignerWalletAdapter,
	WalletName,
	WalletReadyState,
	WalletConnectionError,
	WalletSignTransactionError,
	WalletSignMessageError,
} from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

export const IframeWalletName = "Embedded Wallet" as WalletName;

export class IframeWalletAdapter extends BaseMessageSignerWalletAdapter {
	name = IframeWalletName;
	url = "https://useherald.xyz";
	icon = "/logo_icon.svg";
	supportedTransactionVersions = new Set(["legacy", 0] as const);

	private _publicKey: PublicKey | null = null;
	private _connecting = false;
	private _readyState = WalletReadyState.Installed;
	private _parentOrigin = "*";

	constructor() {
		super();
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const origin = params.get("parentOrigin");
			if (origin) {
				// Normalize origin (e.g., https://drift.trade)
				try {
					this._parentOrigin = new URL(origin).origin;
				} catch {
					this._parentOrigin = "*";
				}
			}

			// Listen for host-initiated events (disconnect / wallet switch)
			window.addEventListener("message", (event) => {
				if (event.source !== window.parent) return;
				if (this._parentOrigin !== "*" && event.origin !== this._parentOrigin) {
					console.warn("[IframeWalletAdapter] Blocked host event from unauthorized origin:", event.origin);
					return;
				}

				const data = event.data;
				if (!data || data.source !== "HERALD_HOST_APPLICATION") return;

				if (data.action === "hostDisconnect") {
					console.log("[IframeWalletAdapter] Host-initiated disconnect received");
					if (this._publicKey) {
						this._publicKey = null;
						this.emit("disconnect");
					}
				} else if (data.action === "hostWalletSwitch") {
					console.log("[IframeWalletAdapter] Host-initiated wallet switch received:", data.params?.address);
					if (data.params?.address) {
						try {
							const newPubkey = new PublicKey(data.params.address);
							if (!this._publicKey || !this._publicKey.equals(newPubkey)) {
								this._publicKey = newPubkey;
								this.emit("connect", newPubkey);
							}
						} catch (err) {
							console.error("[IframeWalletAdapter] Invalid host public key received in switch:", err);
						}
					}
				}
			});
		}
	}

	get publicKey(): PublicKey | null {
		return this._publicKey;
	}

	get connecting(): boolean {
		return this._connecting;
	}

	get readyState(): WalletReadyState {
		return this._readyState;
	}

	async connect(): Promise<void> {
		if (this.connected || this.connecting) return;
		this._connecting = true;

		try {
			const pubkeyStr = await this._sendRequest<string>("connect");
			this._publicKey = new PublicKey(pubkeyStr);
			this.emit("connect", this._publicKey);
		} catch (error: unknown) {
			const errorMsg = error instanceof Error ? error.message : "Failed to connect to host application wallet";
			this.emit(
				"error",
				new WalletConnectionError(errorMsg)
			);
			throw error;
		} finally {
			this._connecting = false;
		}
	}

	async disconnect(): Promise<void> {
		if (!this.connected) return;
		try {
			await this._sendRequest("disconnect");
		} catch {
			// Ignored
		} finally {
			this._publicKey = null;
			this.emit("disconnect");
		}
	}

	async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
		try {
			const isVersioned = "version" in transaction;
			const serialized = transaction.serialize({
				requireAllSignatures: false,
				verifySignatures: false,
			});
			const serializedBase58 = bs58.encode(serialized);

			const response = await this._sendRequest<{ signedTransaction: string }>(
				"signTransaction",
				{
					transaction: serializedBase58,
					isVersioned,
				}
			);

			const signedBytes = bs58.decode(response.signedTransaction);

			if (isVersioned) {
				return VersionedTransaction.deserialize(signedBytes) as unknown as T;
			}
			return Transaction.from(signedBytes) as unknown as T;
		} catch (error: unknown) {
			const errorMsg = error instanceof Error ? error.message : "Transaction signature declined";
			const walletError = new WalletSignTransactionError(errorMsg);
			this.emit("error", walletError);
			throw walletError;
		}
	}

	async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
		const signed: T[] = [];
		for (const tx of transactions) {
			signed.push(await this.signTransaction(tx));
		}
		return signed;
	}

	async signMessage(message: Uint8Array): Promise<Uint8Array> {
		try {
			const messageBase58 = bs58.encode(message);
			const response = await this._sendRequest<{ signature: string }>("signMessage", {
				message: messageBase58,
			});
			return bs58.decode(response.signature);
		} catch (error: unknown) {
			const errorMsg = error instanceof Error ? error.message : "Message signature declined";
			const walletError = new WalletSignMessageError(errorMsg);
			this.emit("error", walletError);
			throw walletError;
		}
	}

	private _sendRequest<R>(action: string, params: Record<string, unknown> = {}): Promise<R> {
		return new Promise<R>((resolve, reject) => {
			const requestId = Math.random().toString(36).substring(2, 9);

			const listener = (event: MessageEvent) => {
				if (event.source !== window.parent) return;
				
				// Validate origin matches the expected parent origin
				if (this._parentOrigin !== "*" && event.origin !== this._parentOrigin) {
					console.warn("Blocked message from unauthorized origin:", event.origin);
					return;
				}

				const data = event.data;
				if (!data || data.target !== "HERALD_PORTAL_IFRAME") return;
				if (data.requestId !== requestId) return;

				window.removeEventListener("message", listener);

				if (data.error) {
					reject(new Error(data.error));
				} else {
					resolve(data.result as R);
				}
			};

			window.addEventListener("message", listener);

			window.parent.postMessage(
				{
					source: "HERALD_PORTAL_IFRAME",
					requestId,
					action,
					params,
				},
				this._parentOrigin
			);
		});
	}
}
