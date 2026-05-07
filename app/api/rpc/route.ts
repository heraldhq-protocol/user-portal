import { type NextRequest, NextResponse } from "next/server";

const CLUSTER = process.env.NEXT_PUBLIC_RPC_CLUSTER ?? "devnet";
const FALLBACK_RPC =
	CLUSTER === "mainnet-beta"
		? "https://api.mainnet-beta.solana.com"
		: "https://api.devnet.solana.com";
const TIMEOUT_MS = 8000;

async function proxyRpc(rpcUrl: string, body: unknown): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		return await fetch(rpcUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			signal: controller.signal,
		});
	} finally {
		clearTimeout(timer);
	}
}

export async function POST(req: NextRequest) {
	const primaryRpcUrl = process.env.SOLANA_RPC_URL;

	if (!primaryRpcUrl) {
		return NextResponse.json(
			{ error: "SOLANA_RPC_URL environment variable is not set" },
			{ status: 500 }
		);
	}

	const body = await req.json();

	// Try primary RPC; fall back to the public cluster endpoint on timeout or network error
	let response: Response;
	try {
		response = await proxyRpc(primaryRpcUrl, body);
	} catch (primaryErr) {
		if (primaryRpcUrl !== FALLBACK_RPC) {
			console.warn("RPC primary failed, retrying on fallback:", (primaryErr as Error).message);
			try {
				response = await proxyRpc(FALLBACK_RPC, body);
			} catch (fallbackErr) {
				console.error("RPC Proxy Error (fallback):", fallbackErr);
				return NextResponse.json({ error: "Failed to proxy RPC request" }, { status: 500 });
			}
		} else {
			console.error("RPC Proxy Error:", primaryErr);
			return NextResponse.json({ error: "Failed to proxy RPC request" }, { status: 500 });
		}
	}

	const data = await response.json();
	return NextResponse.json(data);
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}
