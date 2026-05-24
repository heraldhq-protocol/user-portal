import type { Metadata } from "next";
import { JoinPage } from "./page.client";

interface Props {
	params: Promise<{ protocolId: string }>;
}

async function fetchPublicProtocol(protocolId: string) {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/v1";
	try {
		const res = await fetch(`${apiUrl}/protocols/${protocolId}/public`, {
			next: { revalidate: 60 },
		});
		if (!res.ok) return null;
		return res.json() as Promise<{
			name?: string;
			logoUrl?: string | null;
			websiteUrl?: string | null;
			notificationCategories?: string[];
		}>;
	} catch {
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { protocolId } = await params;
	const protocol = await fetchPublicProtocol(protocolId);
	const name = protocol?.name ?? "a Herald protocol";
	return {
		title: `Get notified by ${name} — Herald`,
		description: `Subscribe to on-chain notifications from ${name}. Your email is encrypted in your browser — no protocol ever sees it.`,
	};
}

export default async function Page({ params }: Props) {
	const { protocolId } = await params;
	const protocol = await fetchPublicProtocol(protocolId);
	return <JoinPage protocol={protocol} />;
}
