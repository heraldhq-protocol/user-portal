/**
 * Herald User Portal API client helper
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const token = typeof window !== "undefined" ? localStorage.getItem("herald_portal_token") : null;

	const headers = new Headers(options.headers);
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(
		`${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
		{
			...options,
			headers,
		}
	);

	if (!response.ok) {
		if (response.status === 401 && typeof window !== "undefined") {
			window.dispatchEvent(new Event("herald:unauthorized"));
		}

		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}

/**
 * POST data to an endpoint using wallet signature for authentication (no JWT needed).
 * Signs a message with the wallet, sends { walletPubkey, signature, message } as body.
 */
export async function fetchApiWithSignature<T>(
	endpoint: string,
	walletPubkey: string,
	signMessage: (message: Uint8Array) => Promise<Uint8Array>,
	extraBody: Record<string, unknown> = {},
): Promise<T> {
	const timestamp = Math.floor(Date.now() / 1000);
	const message = `Delete Herald account: ${walletPubkey}:${timestamp}`;
	const messageBytes = new TextEncoder().encode(message);
	const signatureBytes = await signMessage(messageBytes);

	const { default: bs58 } = await import("bs58");

	const response = await fetch(`${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			walletPubkey,
			signature: bs58.encode(signatureBytes),
			message,
			...extraBody,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}
