import type { Metadata } from "next";
import HowItWorksPage from "./page.client";

export const metadata: Metadata = {
	title: "How It Works",
	description: "Learn how Herald delivers DeFi notifications without compromising your privacy.",
	openGraph: {
		title: "How It Works | Herald",
		description: "Privacy-first architecture for DeFi notifications on Solana.",
		images: [{ url: "/api/og?title=How+It+Works&subtitle=Privacy-First+Architecture&description=Learn+how+Herald+delivers+DeFi+notifications+without+compromising+your+privacy.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=How+It+Works&subtitle=Privacy-First+Architecture&description=Learn+how+Herald+delivers+DeFi+notifications+without+compromising+your+privacy."],
	},
};

export default function Page() {
	return <HowItWorksPage />;
}
