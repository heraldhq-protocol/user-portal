/**
 * Helper to make authenticated API requests using the stored JWT token.
 */
export async function apiFetch(
	endpoint: string,
	options: RequestInit = {},
	token?: string | null
): Promise<Response> {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
	const url = `${apiUrl}${endpoint}`;

	const headers = new Headers(options.headers);

	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	// Default to application/json if not explicitly set and we have a body
	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(url, {
		...options,
		headers,
	});

	return response;
}
