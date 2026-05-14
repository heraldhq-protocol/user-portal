import { type Metadata } from "next";
import { PortalFooter } from "@/components/layout/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";

export const metadata: Metadata = {
	title: "Herald — Private DeFi Notifications for Solana",
	description:
		"Get liquidation warnings, governance votes, and yield alerts sent to your inbox — encrypted before leaving your wallet, verifiable on Solana. No protocol ever sees your email.",
	openGraph: {
		title: "Herald — Private DeFi Notifications for Solana",
		description:
			"Get liquidation warnings, governance votes, and yield alerts sent to your inbox — without sharing your email with any protocol.",
	},
	twitter: {
		title: "Herald — Private DeFi Notifications for Solana",
		description:
			"Get liquidation warnings, governance votes, and yield alerts sent to your inbox — without sharing your email with any protocol.",
	},
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<PortalHeader />
			<main id="main-content" className="flex-1">
				{children}
			</main>
			<PortalFooter />
		</>
	);
}
