import type { Metadata } from "next";
import MarketingPage from "./page.client";

export const metadata: Metadata = {
	title: "Herald",
	description: "Receive DeFi alerts directly to your inbox — without sharing your email with any protocol.",
	openGraph: {
		title: "Herald — Privacy-Preserving Notifications for Solana",
		description: "Receive DeFi alerts directly to your inbox without sharing your email.",
		images: [{ url: "/api/og?title=Herald&subtitle=Privacy-Preserving+Notifications&description=Receive+DeFi+alerts+directly+to+your+inbox+without+sharing+your+email+with+any+protocol.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=Herald&subtitle=Privacy-Preserving+Notifications&description=Receive+DeFi+alerts+directly+to+your+inbox+without+sharing+your+email+with+any+protocol."],
	},
};

export default function Page() {
	return <MarketingPage />;
}
