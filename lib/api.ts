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
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
	}

	return response.json() as Promise<T>;
}
