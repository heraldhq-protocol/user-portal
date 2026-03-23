import { type Metadata } from "next";
import { PortalFooter } from "@/components/layout/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";

export const metadata: Metadata = {
	title: "Herald — The Private Notification Standard for DeFi",
	description:
		"Connect your wallet and receive alerts from any Solana dApp without ever exposing your email address. It is fully encrypted and verifiable on-chain.",
	openGraph: {
		title: "Herald — The Private Notification Standard for DeFi",
		description:
			"Connect your wallet and receive alerts from any Solana dApp without ever exposing your email address.",
	},
	twitter: {
		title: "Herald — The Private Notification Standard for DeFi",
		description:
			"Connect your wallet and receive alerts from any Solana dApp without ever exposing your email address.",
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
