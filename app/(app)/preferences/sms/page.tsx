import type { Metadata } from "next";
import SmsPreferencesPage from "./page.client";

export const metadata: Metadata = {
	title: "SMS Preferences",
	description: "Configure your SMS notification preferences for DeFi alerts.",
	openGraph: {
		title: "SMS Preferences | Herald",
		description: "Configure your SMS notification preferences for DeFi alerts.",
		images: [{ url: "/api/og?title=SMS+Preferences&subtitle=SMS+Settings&description=Configure+your+SMS+notification+preferences+for+DeFi+alerts.", width: 1200, height: 630 }],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/og?title=SMS+Preferences&subtitle=SMS+Settings&description=Configure+your+SMS+notification+preferences+for+DeFi+alerts."],
	},
};

export default function Page() {
	return <SmsPreferencesPage />;
}
