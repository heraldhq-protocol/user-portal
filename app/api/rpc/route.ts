import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const rpcUrl = process.env.SOLANA_RPC_URL;

		if (!rpcUrl) {
			return NextResponse.json(
				{ error: "SOLANA_RPC_URL environment variable is not set" },
				{ status: 500 }
			);
		}

		const body = await req.json();

		const response = await fetch(rpcUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		return NextResponse.json(data);
	} catch (error) {
		console.error("RPC Proxy Error:", error);
		return NextResponse.json(
			{ error: "Failed to proxy RPC request" },
			{ status: 500 }
		);
	}
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
