import { Herald } from "@herald-protocol/sdk";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

/** Derive a deterministic UUID v4 from a wallet address for idempotency. */
function walletToUuid(wallet: string): string {
	const hash = createHash("sha256").update(`herald_welcome:${wallet}`).digest("hex");
	return [
		hash.slice(0, 8),
		hash.slice(8, 12),
		`4${hash.slice(13, 16)}`,
		((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
		hash.slice(20, 32),
	].join("-");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const base64Url = token.split(".")[1];
		if (!base64Url) return null;
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
	} catch {
		return null;
	}
}

export async function POST(req: Request) {
	const authHeader = req.headers.get("authorization");
	if (!authHeader?.startsWith("Bearer ")) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const token = authHeader.slice(7);
	const payload = decodeJwtPayload(token);
	const wallet = payload?.walletPubkey as string | undefined;

	if (!wallet) {
		return NextResponse.json({ error: "Invalid token — no walletPubkey claim" }, { status: 401 });
	}

	const apiKey = process.env.HERALD_API_KEY;
	if (!apiKey) {
		console.error("[herald/welcome] HERALD_API_KEY is not set");
		return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
	}

	try {
		const herald = new Herald({
			apiKey,
			...(process.env.HERALD_GATEWAY_BASE_URL
				? { baseUrl: process.env.HERALD_GATEWAY_BASE_URL }
				: {}),
		});

		await herald.notify({
			wallet,
			subject: "Welcome to Herald, your first notification is here 🔔",
			body: [
				"You're all set! Herald will now deliver notifications from DeFi protocols straight to your inbox, without any protocol ever seeing your email address.",
				"",
				"**What to do next**",
				"- [Discover protocols](https://notify.useherald.xyz/discover) and subscribe to the ones you use",
				"- [Set your preferences](https://notify.useherald.xyz/preferences), including channels, quiet hours and more",
				"- Connect Telegram if you'd like real-time alerts sent straight to your phone",
				"",
				"Welcome aboard. Your inbox is yours again.",
			].join("\n"),
			category: "system",
			idempotencyKey: walletToUuid(wallet),
		});

		return NextResponse.json({ ok: true });
	} catch (err: unknown) {
		const errMsg = err instanceof Error ? err.message : String(err);

		// opted_out and duplicate are acceptable — idempotency is working
		if (
			errMsg.toLowerCase().includes("opted_out") ||
			errMsg.toLowerCase().includes("duplicate")
		) {
			return NextResponse.json({ ok: true });
		}

		console.error("[herald/welcome] Failed to send welcome notification:", err);
		return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
	}
}
